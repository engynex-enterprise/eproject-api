import { Module } from '@nestjs/common';
import { WorkingDaysController } from './working-days.controller.js';
import { WorkingDaysService } from './working-days.service.js';

@Module({
  controllers: [WorkingDaysController],
  providers: [WorkingDaysService],
  exports: [WorkingDaysService],
})
export class WorkingDaysModule {}
