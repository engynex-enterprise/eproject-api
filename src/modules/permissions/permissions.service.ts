import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

export interface PermissionDefinition {
  key: string;
  name: string;
  description: string;
  category: string;
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all available permission definitions.
   * These are hardcoded since they represent the system's capabilities.
   */
  getAll(): PermissionDefinition[] {
    return [
      // Organization permissions
      { key: 'org:update', name: 'Update Organization', description: 'Can update organization settings', category: 'Organization' },
      { key: 'org:delete', name: 'Delete Organization', description: 'Can delete the organization', category: 'Organization' },
      { key: 'org:manage_members', name: 'Manage Members', description: 'Can add/remove/update members', category: 'Organization' },
      { key: 'org:manage_roles', name: 'Manage Roles', description: 'Can create/update/delete roles', category: 'Organization' },
      { key: 'org:manage_billing', name: 'Manage Billing', description: 'Can manage billing and subscription', category: 'Organization' },

      // Project permissions
      { key: 'project:create', name: 'Create Project', description: 'Can create new projects', category: 'Project' },
      { key: 'project:update', name: 'Update Project', description: 'Can update project settings', category: 'Project' },
      { key: 'project:delete', name: 'Delete Project', description: 'Can delete projects', category: 'Project' },
      { key: 'project:manage_members', name: 'Manage Project Members', description: 'Can manage project members', category: 'Project' },

      // Issue permissions
      { key: 'issue:create', name: 'Create Issue', description: 'Can create new issues', category: 'Issue' },
      { key: 'issue:update', name: 'Update Issue', description: 'Can update issues', category: 'Issue' },
      { key: 'issue:delete', name: 'Delete Issue', description: 'Can delete issues', category: 'Issue' },
      { key: 'issue:assign', name: 'Assign Issue', description: 'Can assign issues to users', category: 'Issue' },
      { key: 'issue:transition', name: 'Transition Issue', description: 'Can change issue status', category: 'Issue' },

      // Sprint permissions
      { key: 'sprint:create', name: 'Create Sprint', description: 'Can create sprints', category: 'Sprint' },
      { key: 'sprint:manage', name: 'Manage Sprint', description: 'Can start/complete sprints', category: 'Sprint' },

      // Comment permissions
      { key: 'comment:create', name: 'Create Comment', description: 'Can create comments', category: 'Comment' },
      { key: 'comment:update_own', name: 'Update Own Comments', description: 'Can update own comments', category: 'Comment' },
      { key: 'comment:delete_any', name: 'Delete Any Comment', description: 'Can delete any comment', category: 'Comment' },

      // Admin permissions
      { key: 'admin:manage_workflows', name: 'Manage Workflows', description: 'Can manage workflows', category: 'Admin' },
      { key: 'admin:manage_statuses', name: 'Manage Statuses', description: 'Can manage statuses', category: 'Admin' },
      { key: 'admin:view_audit_log', name: 'View Audit Log', description: 'Can view audit logs', category: 'Admin' },
      { key: 'admin:manage_automations', name: 'Manage Automations', description: 'Can manage automations', category: 'Admin' },
    ];
  }
}
