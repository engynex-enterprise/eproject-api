import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { OrgMembersService } from './org-members.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../../../common/decorators/current-user.decorator.js';

@ApiTags('Organization Members')
@ApiBearerAuth()
@Controller('organizations/:orgId/members')
export class OrgMembersController {
  constructor(private readonly orgMembersService: OrgMembersService) {}

  @Get()
  @ApiOperation({ summary: 'List organization members' })
  @ApiResponse({ status: 200, description: 'List of members' })
  async findAll(@Param('orgId') orgId: string) {
    return this.orgMembersService.findAll(orgId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a member to the organization' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 409, description: 'User already a member' })
  async addMember(
    @Param('orgId') orgId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.orgMembersService.addMember(orgId, dto, user.userId);
  }

  @Patch(':memberId')
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Member updated' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async updateMember(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.orgMembersService.updateMember(orgId, memberId, dto);
  }

  @Delete(':memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Cannot remove owner' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async removeMember(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.orgMembersService.removeMember(orgId, memberId, user.userId);
  }
}
