import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service.js';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class EventLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventLoggingInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    if (!MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    const user = request.user;
    const orgId = request.orgId || request.headers?.['x-org-id'];

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // Fire-and-forget audit log creation
          this.logEvent({
            action: this.resolveAction(method),
            entity: this.resolveEntity(url),
            entityId: this.resolveEntityId(url, responseData),
            userId: user?.id ? Number(user.id) : undefined,
            orgId: orgId ? Number(orgId) : undefined,
            metadata: {
              method,
              url,
              body: this.sanitizeBody(body),
            },
          }).catch((error) => {
            this.logger.error(
              `Failed to create audit log: ${error.message}`,
              error.stack,
            );
          });
        },
      }),
    );
  }

  private async logEvent(data: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: number;
    orgId?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      if (!data.orgId) {
        this.logger.debug('Audit log write skipped: orgId is required');
        return;
      }
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          resourceType: data.entity,
          resourceId: data.entityId ? Number(data.entityId) || null : null,
          userId: data.userId ?? null,
          orgId: data.orgId,
          metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        },
      });
    } catch (error) {
      // Silently fail if AuditLog table doesn't exist yet or any DB error
      this.logger.debug(
        `Audit log write skipped: ${(error as Error).message}`,
      );
    }
  }

  private resolveAction(method: string): string {
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || 'UNKNOWN';
  }

  private resolveEntity(url: string): string {
    // Extract the resource name from the URL path
    // e.g., /api/v1/organizations/123/projects -> "projects"
    const segments = url.split('/').filter(Boolean);
    // Walk backwards to find the first non-ID segment
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      // Skip segments that look like UUIDs or numeric IDs
      if (
        !segment.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ) &&
        !segment.match(/^\d+$/) &&
        segment !== 'api' &&
        segment !== 'v1' &&
        segment !== 'v2'
      ) {
        return segment;
      }
    }
    return 'unknown';
  }

  private resolveEntityId(
    url: string,
    responseData: any,
  ): string | undefined {
    // Try to get ID from response
    if (responseData?.id) {
      return String(responseData.id);
    }
    if (responseData?.data?.id) {
      return String(responseData.data.id);
    }
    // Try to get ID from URL path
    const segments = url.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (
      lastSegment?.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ) ||
      lastSegment?.match(/^\d+$/)
    ) {
      return lastSegment;
    }
    return undefined;
  }

  private sanitizeBody(body: Record<string, any>): Record<string, any> {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const sensitiveKeys = new Set([
      'password',
      'passwordConfirmation',
      'token',
      'secret',
      'accessToken',
      'refreshToken',
      'authorization',
    ]);

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
