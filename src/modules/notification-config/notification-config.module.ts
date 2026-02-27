import { Module } from '@nestjs/common';
import { NotificationConfigController } from './notification-config.controller.js';
import { NotificationConfigService } from './notification-config.service.js';

@Module({
  controllers: [NotificationConfigController],
  providers: [NotificationConfigService],
  exports: [NotificationConfigService],
})
export class NotificationConfigModule {}
