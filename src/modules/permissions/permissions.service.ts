import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns all permissions from the database. */
  async getAll() {
    const perms = await this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
    // Add a computed `name` field so the client has a stable display label
    return perms.map((p) => ({ ...p, name: `${p.resource}:${p.action}` }));
  }
}
