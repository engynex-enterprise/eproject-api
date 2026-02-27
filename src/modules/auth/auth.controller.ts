import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { GitHubAuthGuard } from './guards/github-auth.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google' })
  async googleAuth() {
    // Guard initiates the redirect
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async googleAuthCallback(@Req() req: express.Request, @Res() res: express.Response) {
    const result = await this.authService.validateOAuthLogin(req.user as any);
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const params = new URLSearchParams({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }

  @Public()
  @Get('github')
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub' })
  async githubAuth() {
    // Guard initiates the redirect
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async githubAuthCallback(@Req() req: express.Request, @Res() res: express.Response) {
    const result = await this.authService.validateOAuthLogin(req.user as any);
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const params = new URLSearchParams({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
