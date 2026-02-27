import { Module } from '@nestjs/common';
import { FiltersController } from './filters.controller.js';
import { FiltersService } from './filters.service.js';

@Module({
  controllers: [FiltersController],
  providers: [FiltersService],
  exports: [FiltersService],
})
export class FiltersModule {}
