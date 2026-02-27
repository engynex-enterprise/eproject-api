import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OrgInvitationsService } from './org-invitations.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../../../common/decorators/current-user.decorator.js';

@ApiTags('Organization Invitations')
@ApiBearerAuth()
@Controller('organizations/:orgId/invitations')
export class OrgInvitationsController {
  constructor(private readonly orgInvitationsService: OrgInvitationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send an invitation to join the organization' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  @ApiResponse({ status: 409, description: 'Already a member or invitation pending' })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.orgInvitationsService.create(orgId, dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List organization invitations' })
  @ApiResponse({ status: 200, description: 'List of invitations' })
  async findAll(@Param('orgId') orgId: string) {
    return this.orgInvitationsService.findAll(orgId);
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  async accept(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.orgInvitationsService.accept(dto.token, user.userId);
  }
}
