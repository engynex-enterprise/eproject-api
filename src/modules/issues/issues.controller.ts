import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { IssuesService } from './issues.service.js';
import { CreateIssueDto } from './dto/create-issue.dto.js';
import { UpdateIssueDto } from './dto/update-issue.dto.js';
import { IssueFilterDto } from './dto/issue-filter.dto.js';
import { MoveIssueDto } from './dto/move-issue.dto.js';
import { TransitionIssueDto } from './dto/transition-issue.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator.js';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator.js';

@ApiTags('Issues')
@ApiBearerAuth()
@Controller()
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post('projects/:projectId/issues')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new issue' })
  @ApiResponse({ status: 201, description: 'Issue created' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateIssueDto,
  ) {
    return this.issuesService.create(projectId, user.userId, dto);
  }

  @Get('projects/key/:projectKey/issues')
  @ApiPaginated()
  @ApiOperation({ summary: 'List issues by project key with filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of issues' })
  async findAllByKey(
    @Param('projectKey') projectKey: string,
    @Query() filters: IssueFilterDto,
  ) {
    return this.issuesService.findAllByProjectKey(projectKey, filters);
  }

  @Get('projects/:projectId/issues')
  @ApiPaginated()
  @ApiOperation({ summary: 'List issues in a project with filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of issues' })
  async findAll(
    @Param('projectId') projectId: string,
    @Query() filters: IssueFilterDto,
  ) {
    return this.issuesService.findAllByProject(projectId, filters);
  }

  @Get('issues/:issueId')
  @ApiOperation({ summary: 'Get issue by ID with relations' })
  @ApiResponse({ status: 200, description: 'Issue details' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async findById(@Param('issueId') issueId: string) {
    return this.issuesService.findById(issueId);
  }

  @Patch('issues/:issueId')
  @ApiOperation({ summary: 'Update an issue' })
  @ApiResponse({ status: 200, description: 'Issue updated' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async update(
    @Param('issueId') issueId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateIssueDto,
  ) {
    return this.issuesService.update(issueId, user.userId, dto);
  }

  @Delete('issues/:issueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete an issue' })
  @ApiResponse({ status: 200, description: 'Issue deleted' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async delete(
    @Param('issueId') issueId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.issuesService.softDelete(issueId, user.userId);
  }

  @Patch('issues/:issueId/move')
  @ApiOperation({ summary: 'Move an issue (sprint, status, position)' })
  @ApiResponse({ status: 200, description: 'Issue moved' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async moveIssue(
    @Param('issueId') issueId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: MoveIssueDto,
  ) {
    return this.issuesService.moveIssue(issueId, user.userId, dto);
  }

  @Post('issues/:issueId/transition')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transition an issue to a new status' })
  @ApiResponse({ status: 200, description: 'Issue transitioned' })
  @ApiResponse({ status: 400, description: 'Invalid transition' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async transitionIssue(
    @Param('issueId') issueId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: TransitionIssueDto,
  ) {
    return this.issuesService.transitionIssue(issueId, user.userId, dto);
  }
}
