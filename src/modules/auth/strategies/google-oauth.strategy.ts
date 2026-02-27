import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('auth.google.clientId') || '';
    const clientSecret = configService.get<string>('auth.google.clientSecret') || '';
    const callbackURL = configService.get<string>('auth.google.callbackUrl') || '';
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;

    const user = {
      email: emails?.[0]?.value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      avatar: photos?.[0]?.value || null,
      provider: 'google' as const,
      providerId: profile.id,
    };

    done(null, user);
  }
}
