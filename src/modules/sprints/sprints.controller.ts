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
import { SprintsService } from './sprints.service.js';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Sprints')
@ApiBearerAuth()
@Controller()
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post('projects/:projectId/sprints')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new sprint' })
  @ApiResponse({ status: 201, description: 'Sprint created' })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.sprintsService.create(projectId, dto);
  }

  @Get('projects/key/:projectKey/sprints')
  @ApiOperation({ summary: 'List sprints by project key' })
  @ApiResponse({ status: 200, description: 'List of sprints' })
  async findAllByKey(@Param('projectKey') projectKey: string) {
    return this.sprintsService.findAllByProjectKey(projectKey);
  }

  @Get('projects/:projectId/sprints')
  @ApiOperation({ summary: 'List sprints in a project' })
  @ApiResponse({ status: 200, description: 'List of sprints' })
  async findAll(@Param('projectId') projectId: string) {
    return this.sprintsService.findAllByProject(projectId);
  }

  @Get('sprints/:sprintId')
  @ApiOperation({ summary: 'Get sprint by ID' })
  @ApiResponse({ status: 200, description: 'Sprint details' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  async findById(@Param('sprintId') sprintId: string) {
    return this.sprintsService.findById(sprintId);
  }

  @Patch('sprints/:sprintId')
  @ApiOperation({ summary: 'Update a sprint' })
  @ApiResponse({ status: 200, description: 'Sprint updated' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  async update(
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.sprintsService.update(sprintId, dto);
  }

  @Delete('sprints/:sprintId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a sprint' })
  @ApiResponse({ status: 200, description: 'Sprint deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete active sprint' })
  async delete(@Param('sprintId') sprintId: string) {
    return this.sprintsService.delete(sprintId);
  }

  @Post('sprints/:sprintId/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a sprint (only 1 active per project)' })
  @ApiResponse({ status: 200, description: 'Sprint started' })
  @ApiResponse({ status: 400, description: 'Another sprint is already active' })
  async start(
    @Param('sprintId') sprintId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sprintsService.startSprint(sprintId, user.userId);
  }

  @Post('sprints/:sprintId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a sprint (moves incomplete issues to backlog)' })
  @ApiResponse({ status: 200, description: 'Sprint completed' })
  @ApiResponse({ status: 400, description: 'Sprint is not active' })
  async complete(
    @Param('sprintId') sprintId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sprintsService.completeSprint(sprintId, user.userId);
  }
}
