import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { generateSlug } from '../../common/utils/slug.util.js';
import { EventEmitterService } from '../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../shared/events/event-types.js';
import { MailService } from '../../shared/mail/mail.service.js';
import { randomBytes, createHash } from 'crypto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitterService,
    private readonly mailService: MailService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const slug = generateSlug(`${dto.firstName} ${dto.lastName}`);

    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          displayName: `${dto.firstName} ${dto.lastName}`,
          isActive: true,
          isEmailVerified: false,
        },
      });

      // Create personal organization
      const org = await tx.organization.create({
        data: {
          name: `${dto.firstName}'s Workspace`,
          slug: `${slug}-${randomBytes(3).toString('hex')}`,
          isPersonal: true,
        },
      });

      // Find or create the OWNER role for the org
      let ownerRole = await tx.role.findFirst({
        where: { name: 'OWNER', isSystem: true },
      });
      if (!ownerRole) {
        ownerRole = await tx.role.create({
          data: {
            name: 'OWNER',
            description: 'Organization owner',
            isSystem: true,
            scope: 'organization',
            orgId: org.id,
          },
        });
      }

      // Add user as owner member of the personal org
      await tx.organizationMember.create({
        data: {
          userId: user.id,
          orgId: org.id,
          roleId: ownerRole.id,
        },
      });

      return user;
    });

    const tokens = await this.generateTokens(result.id, result.email);

    this.eventEmitter.emit(EventTypes.USER_REGISTERED, {
      userId: result.id,
      email: result.email,
      timestamp: new Date(),
    });

    // Send email verification (fire-and-forget)
    this.sendVerificationEmail(result.id, result.email, result.firstName).catch((err) =>
      this.logger.error(`Failed to send verification email: ${(err as Error).message}`),
    );

    return {
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    this.eventEmitter.emit(EventTypes.USER_LOGGED_IN, {
      userId: user.id,
      timestamp: new Date(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('auth.refresh.secret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: Number(payload.sub) },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      this.logger.warn(`Failed to refresh tokens: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Invalidate any previous unused password reset tokens
    await this.prisma.verificationToken.updateMany({
      where: { userId: user.id, type: 'password_reset', usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    this.mailService.sendSystemMail({
      to: user.email,
      subject: 'Recupera tu contraseña — eProject',
      html: `<p>Hola ${user.firstName},</p>
<p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
<p><a href="${resetLink}">${resetLink}</a></p>
<p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
<p>— El equipo de eProject</p>`,
    }).catch((err) =>
      this.logger.error(`Failed to send password reset email: ${(err as Error).message}`),
    );

    this.eventEmitter.emit(EventTypes.USER_PASSWORD_RESET, {
      userId: user.id,
      timestamp: new Date(),
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedToken = this.hashToken(token);

    const record = await this.prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
        type: 'password_reset',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: hashedPassword },
      }),
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Invalid verification token');
    }

    const hashedToken = this.hashToken(token);

    const record = await this.prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
        type: 'email_verification',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true },
      }),
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    this.eventEmitter.emit(EventTypes.USER_EMAIL_VERIFIED, {
      userId: record.userId,
      timestamp: new Date(),
    });

    return { message: 'Email verified successfully' };
  }

  private async sendVerificationEmail(userId: number, email: string, firstName: string): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);

    await this.prisma.verificationToken.create({
      data: {
        userId,
        token: hashedToken,
        type: 'email_verification',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');
    const verifyLink = `${frontendUrl}/verify-email?token=${rawToken}`;

    await this.mailService.sendSystemMail({
      to: email,
      subject: 'Verifica tu correo electrónico — eProject',
      html: `<p>Hola ${firstName},</p>
<p>Bienvenido/a a eProject. Para verificar tu cuenta haz clic en el siguiente enlace:</p>
<p><a href="${verifyLink}">${verifyLink}</a></p>
<p>Este enlace expira en 24 horas.</p>
<p>— El equipo de eProject</p>`,
    });
  }

  async validateOAuthLogin(profile: {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    provider: string;
    providerId: string;
  }): Promise<AuthResponse> {
    if (!profile.email) {
      throw new BadRequestException('Email is required from OAuth provider');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email.toLowerCase() },
    });

    if (!user) {
      // Create new user from OAuth
      const slug = generateSlug(`${profile.firstName} ${profile.lastName}`);

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: profile.email.toLowerCase(),
            firstName: profile.firstName,
            lastName: profile.lastName,
            displayName: `${profile.firstName} ${profile.lastName}`,
            avatarUrl: profile.avatar,
            isActive: true,
            isEmailVerified: true,
          },
        });

        // Store OAuth account info in the OAuthAccount table
        await tx.oAuthAccount.create({
          data: {
            userId: newUser.id,
            provider: profile.provider,
            providerUserId: profile.providerId,
          },
        });

        // Create personal organization
        const org = await tx.organization.create({
          data: {
            name: `${profile.firstName}'s Workspace`,
            slug: `${slug}-${randomBytes(3).toString('hex')}`,
            isPersonal: true,
          },
        });

        // Find or create the OWNER role
        let ownerRole = await tx.role.findFirst({
          where: { name: 'OWNER', isSystem: true },
        });
        if (!ownerRole) {
          ownerRole = await tx.role.create({
            data: {
              name: 'OWNER',
              description: 'Organization owner',
              isSystem: true,
              scope: 'organization',
              orgId: org.id,
            },
          });
        }

        await tx.organizationMember.create({
          data: {
            userId: newUser.id,
            orgId: org.id,
            roleId: ownerRole.id,
          },
        });

        return newUser;
      });
    } else {
      // Update existing user with OAuth info if not set
      const existingOAuth = await this.prisma.oAuthAccount.findFirst({
        where: {
          userId: user.id,
          provider: profile.provider,
        },
      });

      if (!existingOAuth) {
        await this.prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: profile.provider,
            providerUserId: profile.providerId,
          },
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            avatarUrl: user.avatarUrl || profile.avatar,
            lastLoginAt: new Date(),
          },
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async generateTokens(userId: number, email: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('auth.jwt.secret'),
          expiresIn: (this.configService.get<string>('auth.jwt.expiresIn') ?? '15m') as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('auth.refresh.secret'),
          expiresIn: (this.configService.get<string>('auth.refresh.expiresIn') ?? '7d') as any,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
