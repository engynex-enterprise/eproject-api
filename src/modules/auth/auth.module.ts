import { Module, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy.js';
import { GitHubOAuthStrategy } from './strategies/github-oauth.strategy.js';
import { MailModule } from '../../shared/mail/mail.module.js';

/**
 * Conditionally register OAuth strategies only when credentials are configured.
 * This prevents the app from crashing when Google/GitHub env vars are missing.
 */
function buildOAuthProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.GOOGLE_CLIENT_ID) {
    providers.push(GoogleOAuthStrategy);
  }
  if (process.env.GITHUB_CLIENT_ID) {
    providers.push(GitHubOAuthStrategy);
  }

  return providers;
}

@Module({
  imports: [
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret') || 'secret',
        signOptions: {
          expiresIn: (configService.get<string>('auth.jwt.expiresIn') ?? '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    ...buildOAuthProviders(),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
