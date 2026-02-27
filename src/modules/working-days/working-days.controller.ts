import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { WorkingDaysService } from './working-days.service.js';
import { UpdateWorkingDaysDto } from './dto/update-working-days.dto.js';

@ApiTags('Working Days')
@ApiBearerAuth()
@Controller()
export class WorkingDaysController {
  constructor(private readonly workingDaysService: WorkingDaysService) {}

  @Get('projects/:projectId/working-days')
  @ApiOperation({ summary: 'Get project working days configuration' })
  @ApiResponse({ status: 200, description: 'Working days config' })
  async getProjectWorkingDays(@Param('projectId') projectId: string) {
    return this.workingDaysService.getProjectWorkingDays(projectId);
  }

  @Patch('projects/:projectId/working-days')
  @ApiOperation({ summary: 'Update project working days configuration' })
  @ApiResponse({ status: 200, description: 'Working days updated' })
  async updateProjectWorkingDays(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateWorkingDaysDto,
  ) {
    return this.workingDaysService.updateProjectWorkingDays(projectId, dto);
  }

  @Get('spaces/:spaceId/working-days')
  @ApiOperation({ summary: 'Get space working days configuration' })
  @ApiResponse({ status: 200, description: 'Working days config (falls back to project)' })
  async getSpaceWorkingDays(@Param('spaceId') spaceId: string) {
    return this.workingDaysService.getSpaceWorkingDays(spaceId);
  }

  @Patch('spaces/:spaceId/working-days')
  @ApiOperation({ summary: 'Update space working days configuration' })
  @ApiResponse({ status: 200, description: 'Working days updated' })
  async updateSpaceWorkingDays(
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateWorkingDaysDto,
  ) {
    return this.workingDaysService.updateSpaceWorkingDays(spaceId, dto);
  }
}
