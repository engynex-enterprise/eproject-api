import { Module } from '@nestjs/common';
import { OrgInvitationsController } from './org-invitations.controller.js';
import { OrgInvitationsService } from './org-invitations.service.js';
import { MailModule } from '../../../../shared/mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [OrgInvitationsController],
  providers: [OrgInvitationsService],
  exports: [OrgInvitationsService],
})
export class OrgInvitationsModule {}
