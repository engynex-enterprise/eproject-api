import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TimelineService } from './timeline.service.js';
import { TimelineQueryDto } from './dto/timeline-query.dto.js';

@ApiTags('Timeline')
@ApiBearerAuth()
@Controller()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('projects/key/:projectKey/timeline')
  @ApiOperation({ summary: 'Get project timeline by project key' })
  @ApiResponse({ status: 200, description: 'Timeline data' })
  async getTimelineByKey(
    @Param('projectKey') projectKey: string,
    @Query() query: TimelineQueryDto,
  ) {
    return this.timelineService.getTimelineByKey(projectKey, query);
  }

  @Get('projects/:projectId/timeline')
  @ApiOperation({ summary: 'Get project timeline (Gantt data)' })
  @ApiResponse({ status: 200, description: 'Timeline data with issues and dates' })
  async getTimeline(
    @Param('projectId') projectId: string,
    @Query() query: TimelineQueryDto,
  ) {
    return this.timelineService.getTimeline(projectId, query);
  }
}
