import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';
import { OrgMembersModule } from './sub-modules/org-members/org-members.module.js';
import { OrgInvitationsModule } from './sub-modules/org-invitations/org-invitations.module.js';

@Module({
  imports: [OrgMembersModule, OrgInvitationsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
