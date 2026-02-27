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
import { AutomationsService } from './automations.service.js';
import { CreateAutomationDto } from './dto/create-automation.dto.js';
import { UpdateAutomationDto } from './dto/update-automation.dto.js';

@ApiTags('Automations')
@ApiBearerAuth()
@Controller()
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post('projects/:projectId/automations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an automation rule' })
  @ApiResponse({ status: 201, description: 'Automation created' })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAutomationDto,
  ) {
    return this.automationsService.create(projectId, dto);
  }

  @Get('projects/:projectId/automations')
  @ApiOperation({ summary: 'List automations in a project' })
  @ApiResponse({ status: 200, description: 'List of automations' })
  async findAll(@Param('projectId') projectId: string) {
    return this.automationsService.findAllByProject(projectId);
  }

  @Get('automations/:automationId')
  @ApiOperation({ summary: 'Get automation by ID' })
  @ApiResponse({ status: 200, description: 'Automation details' })
  @ApiResponse({ status: 404, description: 'Automation not found' })
  async findById(@Param('automationId') automationId: string) {
    return this.automationsService.findById(automationId);
  }

  @Patch('automations/:automationId')
  @ApiOperation({ summary: 'Update an automation' })
  @ApiResponse({ status: 200, description: 'Automation updated' })
  @ApiResponse({ status: 404, description: 'Automation not found' })
  async update(
    @Param('automationId') automationId: string,
    @Body() dto: UpdateAutomationDto,
  ) {
    return this.automationsService.update(automationId, dto);
  }

  @Delete('automations/:automationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an automation' })
  @ApiResponse({ status: 200, description: 'Automation deleted' })
  @ApiResponse({ status: 404, description: 'Automation not found' })
  async delete(@Param('automationId') automationId: string) {
    return this.automationsService.delete(automationId);
  }
}
