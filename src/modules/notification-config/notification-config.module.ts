import { Module } from '@nestjs/common';
import { NotificationConfigController } from './notification-config.controller.js';
import { NotificationConfigService } from './notification-config.service.js';
import { MailModule } from '../../shared/mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [NotificationConfigController],
  providers: [NotificationConfigService],
  exports: [NotificationConfigService],
})
export class NotificationConfigModule {}
