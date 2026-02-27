import { Module } from '@nestjs/common';
import { OrgMembersController } from './org-members.controller.js';
import { OrgMembersService } from './org-members.service.js';

@Module({
  controllers: [OrgMembersController],
  providers: [OrgMembersService],
  exports: [OrgMembersService],
})
export class OrgMembersModule {}
