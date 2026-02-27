import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateRoleDto) {
    const numOrgId = Number(orgId);

    return this.prisma.role.create({
      data: {
        orgId: numOrgId,
        name: dto.name,
        description: dto.description,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findAllByOrg(orgId: string) {
    const numOrgId = Number(orgId);

    return this.prisma.role.findMany({
      where: { orgId: numOrgId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(roleId: string) {
    const numRoleId = Number(roleId);

    const role = await this.prisma.role.findUnique({
      where: { id: numRoleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(roleId: string, dto: UpdateRoleDto) {
    const numRoleId = Number(roleId);

    const role = await this.prisma.role.findUnique({
      where: { id: numRoleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.role.update({
      where: { id: numRoleId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
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
