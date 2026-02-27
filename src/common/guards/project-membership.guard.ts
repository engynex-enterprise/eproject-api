import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class ProjectMembershipGuard implements CanActivate {
  private readonly logger = new Logger(ProjectMembershipGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId =
      request.params?.projectId || request.params?.project_id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    try {
      const membership = await this.prisma.projectMember.findFirst({
        where: {
          userId: Number(user.id),
          projectId: Number(projectId),
        },
        include: { role: true },
      });

      if (!membership) {
        this.logger.warn(
          `User ${user.id} attempted to access project ${projectId} without membership`,
        );
        throw new ForbiddenException(
          'You are not a member of this project',
        );
      }

      // Attach the project role to the request for downstream use
      request.projectRole = membership.role;
      request.projectMembership = membership;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Error checking project membership: ${(error as Error).message}`,
      );
      throw new ForbiddenException('Unable to verify project membership');
    }
  }
}
