import { Global, Module } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service.js';
import { NotificationListener } from './notification.listener.js';
import { NotificationsModule } from '../../modules/notifications/notifications.module.js';
import { MailModule } from '../mail/mail.module.js';
import { DatabaseModule } from '../../database/database.module.js';

@Global()
@Module({
  imports: [NotificationsModule, MailModule, DatabaseModule],
  providers: [EventEmitterService, NotificationListener],
  exports: [EventEmitterService],
})
export class EventsModule {}
