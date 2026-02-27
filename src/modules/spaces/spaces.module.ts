import { Module } from '@nestjs/common';
import { SpacesController } from './spaces.controller.js';
import { SpacesService } from './spaces.service.js';

@Module({
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
