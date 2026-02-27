import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';
import { paginate, PaginationMeta } from '../../common/dto/pagination.dto.js';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrg(orgId: string, query: AuditLogQueryDto) {
    const numericOrgId = Number(orgId);
    const where: any = { orgId: numericOrgId };

    if (query.action) where.action = query.action;
    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.userId) where.userId = Number(query.userId);

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: new PaginationMeta(page, limit, total),
    };
  }

  /**
   * Record an audit log entry (used internally by services)
   */
  async log(data: {
    orgId: string | number;
    userId: string | number;
    action: string;
    resourceType: string;
    resourceId?: number;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        orgId: Number(data.orgId),
        userId: Number(data.userId),
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadata: data.metadata || {},
        ipAddress: data.ipAddress,
      },
    });
  }
}
