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
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('organizations/:orgId/projects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created with default statuses, types, priorities, board, and workflow' })
  @ApiResponse({ status: 409, description: 'Project key already exists' })
  async create(
    @Param('orgId') orgId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(orgId, user.userId, dto);
  }

  @Get('organizations/:orgId/projects')
  @ApiOperation({ summary: 'List projects in an organization' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async findAllByOrg(@Param('orgId') orgId: string) {
    return this.projectsService.findAllByOrg(orgId);
  }

  @Get('projects/key/:projectKey')
  @ApiOperation({ summary: 'Get project by key' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findByKey(@Param('projectKey') projectKey: string) {
    return this.projectsService.findByKeyOnly(projectKey);
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findById(@Param('projectId') projectId: string) {
    return this.projectsService.findById(projectId);
  }

  @Patch('projects/:projectId')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('projectId') projectId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(projectId, user.userId, dto);
  }

  @Post('projects/:projectId/members')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 409, description: 'User already a member' })
  async addMember(
    @Param('projectId') projectId: string,
    @Body() body: { userId: number; roleId: number },
  ) {
    return this.projectsService.addMember(projectId, body.userId, body.roleId);
  }

  @Get('projects/:projectId/members')
  @ApiOperation({ summary: 'Get project members' })
  @ApiResponse({ status: 200, description: 'List of project members' })
  async getMembers(@Param('projectId') projectId: string) {
    return this.projectsService.getMembers(projectId);
  }

  @Get('organizations/:orgId/roles/all')
  @ApiOperation({ summary: 'Get all available roles for an org' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async getRolesForOrg(@Param('orgId') orgId: string) {
    return this.projectsService.getProjectRoles(orgId);
  }

  @Delete('projects/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async delete(
    @Param('projectId') projectId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.projectsService.softDelete(projectId, user.userId);
  }
}
