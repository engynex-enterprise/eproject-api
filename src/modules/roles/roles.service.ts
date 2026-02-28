import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

// Prisma include for role with flat permissions
const ROLE_INCLUDE = {
  permissions: {
    include: { permission: true },
  },
} as const;

// Flatten the join-table permissions into a direct Permission[]
function flattenRole<T extends { permissions: { permission: any }[] }>(role: T) {
  return {
    ...role,
    permissions: role.permissions.map((rp) => ({
      ...rp.permission,
      name: `${rp.permission.resource}:${rp.permission.action}`,
    })),
  };
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateRoleDto) {
    const numOrgId = Number(orgId);

    const role = await this.prisma.role.create({
      data: {
        orgId: numOrgId,
        name: dto.name,
        description: dto.description,
        ...(dto.permissionIds?.length
          ? {
              permissions: {
                create: dto.permissionIds.map((id) => ({ permissionId: id })),
              },
            }
          : {}),
      },
      include: ROLE_INCLUDE,
    });

    return flattenRole(role);
  }

  async findAllByOrg(orgId: string) {
    const numOrgId = Number(orgId);

    const roles = await this.prisma.role.findMany({
      where: {
        OR: [
          { orgId: numOrgId },
          { orgId: null, scope: 'organization', isSystem: true },
        ],
      },
      include: ROLE_INCLUDE,
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return roles.map(flattenRole);
  }

  async findById(roleId: string) {
    const numRoleId = Number(roleId);

    const role = await this.prisma.role.findUnique({
      where: { id: numRoleId },
      include: ROLE_INCLUDE,
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return flattenRole(role);
  }

  async update(roleId: string, dto: UpdateRoleDto) {
    const numRoleId = Number(roleId);

    const role = await this.prisma.role.findUnique({
      where: { id: numRoleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Replace permissions if permissionIds provided
    if (dto.permissionIds !== undefined) {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: numRoleId },
      });
      if (dto.permissionIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: dto.permissionIds.map((permId) => ({
            roleId: numRoleId,
            permissionId: permId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const updated = await this.prisma.role.update({
      where: { id: numRoleId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: ROLE_INCLUDE,
    });

    return flattenRole(updated);
  }

  async delete(roleId: string) {
    const numRoleId = Number(roleId);

    const role = await this.prisma.role.findUnique({
      where: { id: numRoleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.role.delete({
      where: { id: numRoleId },
    });

    return { message: 'Role deleted successfully' };
  }
}
