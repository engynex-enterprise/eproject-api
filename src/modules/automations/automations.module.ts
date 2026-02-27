import { Module } from '@nestjs/common';
import { AutomationsController } from './automations.controller.js';
import { AutomationsService } from './automations.service.js';

@Module({
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
