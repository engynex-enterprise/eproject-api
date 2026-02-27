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
import { WorkflowsService } from './workflows.service.js';
import { CreateWorkflowDto } from './dto/create-workflow.dto.js';
import { UpdateWorkflowDto } from './dto/update-workflow.dto.js';
import { CreateTransitionDto } from './dto/create-transition.dto.js';

@ApiTags('Workflows')
@ApiBearerAuth()
@Controller()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post('projects/:projectId/workflows')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created' })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(projectId, dto);
  }

  @Get('projects/:projectId/workflows')
  @ApiOperation({ summary: 'List workflows in a project' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  async findAll(@Param('projectId') projectId: string) {
    return this.workflowsService.findAllByProject(projectId);
  }

  @Get('workflows/:workflowId')
  @ApiOperation({ summary: 'Get workflow by ID with transitions' })
  @ApiResponse({ status: 200, description: 'Workflow details' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findById(@Param('workflowId') workflowId: string) {
    return this.workflowsService.findById(workflowId);
  }

  @Patch('workflows/:workflowId')
  @ApiOperation({ summary: 'Update a workflow' })
  @ApiResponse({ status: 200, description: 'Workflow updated' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async update(
    @Param('workflowId') workflowId: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(workflowId, dto);
  }

  @Delete('workflows/:workflowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deleted' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async delete(@Param('workflowId') workflowId: string) {
    return this.workflowsService.delete(workflowId);
  }

  @Post('workflows/:workflowId/transitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a transition to a workflow' })
  @ApiResponse({ status: 201, description: 'Transition added' })
  async addTransition(
    @Param('workflowId') workflowId: string,
    @Body() dto: CreateTransitionDto,
  ) {
    return this.workflowsService.addTransition(workflowId, dto);
  }

  @Delete('workflows/transitions/:transitionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a transition from a workflow' })
  @ApiResponse({ status: 200, description: 'Transition removed' })
  async removeTransition(@Param('transitionId') transitionId: string) {
    return this.workflowsService.removeTransition(transitionId);
  }
}
