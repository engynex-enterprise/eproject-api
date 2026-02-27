import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubOAuthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('auth.github.clientId') || '';
    const clientSecret = configService.get<string>('auth.github.clientSecret') || '';
    const callbackURL = configService.get<string>('auth.github.callbackUrl') || '';
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<void> {
    const emails = profile.emails || [];
    const user = {
      email: emails[0]?.value || null,
      firstName: profile.displayName?.split(' ')[0] || profile.username || '',
      lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
      avatar: profile.photos?.[0]?.value || null,
      provider: 'github' as const,
      providerId: profile.id,
    };

    done(null, user);
  }
}
