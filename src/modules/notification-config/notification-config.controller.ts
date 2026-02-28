import { Controller, Get, Patch, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationConfigService } from './notification-config.service.js';
import { UpdateNotificationConfigDto } from './dto/index.js';
import { MailService } from '../../shared/mail/mail.service.js';

@ApiTags('Notification Config')
@ApiBearerAuth()
@Controller('organizations/:orgId/notification-config')
export class NotificationConfigController {
  constructor(
    private readonly service: NotificationConfigService,
    private readonly mailService: MailService,
  ) {}

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

  @Post('test')
  @ApiOperation({ summary: 'Test email provider connection' })
  @ApiResponse({ status: 200, description: 'Test result' })
  async testConnection(@Param('orgId') orgId: string) {
    return this.mailService.testConnection(Number(orgId));
  }
}
