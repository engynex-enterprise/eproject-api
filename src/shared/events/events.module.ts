import { Global, Module } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service.js';

@Global()
@Module({
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventsModule {}
