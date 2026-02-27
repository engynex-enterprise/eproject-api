import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EstimationsService } from './estimations.service.js';
import { UpdateEstimationConfigDto } from './dto/update-estimation-config.dto.js';

@ApiTags('Estimations')
@ApiBearerAuth()
@Controller()
export class EstimationsController {
  constructor(private readonly estimationsService: EstimationsService) {}

  @Get('projects/:projectId/estimations')
  @ApiOperation({ summary: 'Get project estimation configuration' })
  @ApiResponse({ status: 200, description: 'Estimation config' })
  async getProjectEstimation(@Param('projectId') projectId: string) {
    return this.estimationsService.getProjectEstimation(projectId);
  }

  @Patch('projects/:projectId/estimations')
  @ApiOperation({ summary: 'Update project estimation configuration' })
  @ApiResponse({ status: 200, description: 'Estimation config updated' })
  async updateProjectEstimation(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateEstimationConfigDto,
  ) {
    return this.estimationsService.updateProjectEstimation(projectId, dto);
  }

  @Get('spaces/:spaceId/estimations')
  @ApiOperation({ summary: 'Get space estimation configuration' })
  @ApiResponse({ status: 200, description: 'Estimation config (falls back to project)' })
  async getSpaceEstimation(@Param('spaceId') spaceId: string) {
    return this.estimationsService.getSpaceEstimation(spaceId);
  }

  @Patch('spaces/:spaceId/estimations')
  @ApiOperation({ summary: 'Update space estimation configuration' })
  @ApiResponse({ status: 200, description: 'Estimation config updated' })
  async updateSpaceEstimation(
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateEstimationConfigDto,
  ) {
    return this.estimationsService.updateSpaceEstimation(spaceId, dto);
  }
}
