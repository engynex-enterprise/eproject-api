import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { ReportQueryDto } from './dto/report-query.dto.js';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('projects/:projectId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sprint-burndown')
  @ApiOperation({ summary: 'Get sprint burndown data' })
  @ApiResponse({ status: 200, description: 'Burndown chart data' })
  async getSprintBurndown(
    @Param('projectId') projectId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getSprintBurndown(projectId, query);
  }

  @Get('velocity')
  @ApiOperation({ summary: 'Get velocity report (last 10 sprints)' })
  @ApiResponse({ status: 200, description: 'Velocity data' })
  async getVelocity(@Param('projectId') projectId: string) {
    return this.reportsService.getVelocity(projectId);
  }

  @Get('created-vs-resolved')
  @ApiOperation({ summary: 'Get created vs resolved issues report' })
  @ApiResponse({ status: 200, description: 'Created vs resolved data' })
  async getCreatedVsResolved(
    @Param('projectId') projectId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getCreatedVsResolved(projectId, query);
  }
}
