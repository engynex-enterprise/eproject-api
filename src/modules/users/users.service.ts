import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const numericId = Number(id);

    const user = await this.prisma.user.findUnique({
      where: { id: numericId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
        phone: true,
        timezone: true,
        locale: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async update(userId: string, dto: UpdateUserDto) {
    const numericUserId = Number(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: numericUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: numericUserId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.locale !== undefined && { locale: dto.locale }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
        phone: true,
        timezone: true,
        locale: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async searchByEmailInOrg(orgId: string, email: string) {
    const numOrgId = Number(orgId);
    const lowerEmail = email.toLowerCase().trim();

    const orgMembers = await this.prisma.organizationMember.findMany({
      where: {
        orgId: numOrgId,
        isActive: true,
        user: {
          email: { contains: lowerEmail, mode: 'insensitive' },
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      take: 10,
    });

    return orgMembers.map((m) => m.user);
  }

  async getProfile(userId: string) {
    const numericUserId = Number(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: numericUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
        phone: true,
        timezone: true,
        locale: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
