import { Module } from '@nestjs/common';
import { OrgInvitationsController } from './org-invitations.controller.js';
import { OrgInvitationsService } from './org-invitations.service.js';

@Module({
  controllers: [OrgInvitationsController],
  providers: [OrgInvitationsService],
  exports: [OrgInvitationsService],
})
export class OrgInvitationsModule {}
