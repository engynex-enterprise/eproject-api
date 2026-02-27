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
import { StatusesService } from './statuses.service.js';
import { CreateProjectStatusDto } from './dto/create-project-status.dto.js';

@ApiTags('Statuses')
@ApiBearerAuth()
@Controller()
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Get('statuses')
  @ApiOperation({ summary: 'List system statuses' })
  @ApiResponse({ status: 200, description: 'List of system statuses' })
  async findSystemStatuses() {
    return this.statusesService.findSystemStatuses();
  }

  @Get('projects/:projectId/statuses')
  @ApiOperation({ summary: 'List project statuses' })
  @ApiResponse({ status: 200, description: 'List of project statuses' })
  async findProjectStatuses(@Param('projectId') projectId: string) {
    return this.statusesService.findProjectStatuses(projectId);
  }

  @Post('projects/:projectId/statuses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a status to a project' })
  @ApiResponse({ status: 201, description: 'Status added to project' })
  async addProjectStatus(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectStatusDto,
  ) {
    return this.statusesService.addProjectStatus(projectId, dto);
  }

  @Patch('statuses/:statusId')
  @ApiOperation({ summary: 'Update a project status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Status not found' })
  async updateProjectStatus(
    @Param('statusId') statusId: string,
    @Body() data: { sortOrder?: number; isDefault?: boolean },
  ) {
    return this.statusesService.updateProjectStatus(statusId, data);
  }

  @Delete('statuses/:statusId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a project status' })
  @ApiResponse({ status: 200, description: 'Status deleted' })
  @ApiResponse({ status: 404, description: 'Status not found or in use' })
  async deleteProjectStatus(@Param('statusId') statusId: string) {
    return this.statusesService.deleteProjectStatus(statusId);
  }
}
