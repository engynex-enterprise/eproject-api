import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class OrgMembershipGuard implements CanActivate {
  private readonly logger = new Logger(OrgMembershipGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId =
      request.params?.orgId ||
      request.orgId ||
      request.headers['x-org-id'];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!orgId) {
      throw new ForbiddenException('Organization ID is required');
    }

    try {
      const membership = await this.prisma.organizationMember.findFirst({
        where: {
          userId: Number(user.id),
          orgId: Number(orgId),
        },
        include: { role: true },
      });

      if (!membership) {
        this.logger.warn(
          `User ${user.id} attempted to access org ${orgId} without membership`,
        );
        throw new ForbiddenException(
          'You are not a member of this organization',
        );
      }

      // Attach the membership role to the request for downstream use
      request.orgRole = membership.role;
      request.orgMembership = membership;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Error checking org membership: ${(error as Error).message}`,
      );
      throw new ForbiddenException('Unable to verify organization membership');
    }
  }
}
