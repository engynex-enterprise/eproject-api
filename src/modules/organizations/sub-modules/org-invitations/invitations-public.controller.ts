import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { OrgInvitationsService } from './org-invitations.service.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../../common/decorators/public.decorator.js';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsPublicController {
  constructor(private readonly orgInvitationsService: OrgInvitationsService) {}

  @Public()
  @Get('preview')
  @ApiOperation({ summary: 'Get invitation preview by token (no auth required)' })
  @ApiQuery({ name: 'token', required: true, description: 'Invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation preview info' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  async preview(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.orgInvitationsService.getPreview(token);
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an invitation (auth required, no orgId needed)' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  async accept(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.orgInvitationsService.accept(dto.token, user.userId);
  }
}
