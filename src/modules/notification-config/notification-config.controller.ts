import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationConfigService } from './notification-config.service.js';
import { UpdateNotificationConfigDto } from './dto/index.js';

@ApiTags('Notification Config')
@ApiBearerAuth()
@Controller('organizations/:orgId/notification-config')
export class NotificationConfigController {
  constructor(private readonly service: NotificationConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get organization notification configuration' })
  @ApiResponse({ status: 200, description: 'Notification configuration' })
  async get(@Param('orgId') orgId: string) {
    return this.service.getByOrg(orgId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update organization notification configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  async update(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateNotificationConfigDto,
  ) {
    return this.service.update(orgId, dto);
  }
}
