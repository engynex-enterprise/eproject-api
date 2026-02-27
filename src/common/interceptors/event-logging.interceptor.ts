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

// Keys whose values should be redacted from the logged body
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordconfirmation',
  'token',
  'secret',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'apikey',
  'sendgridapikey',
  'smtppassword',
  'awssecretaccesskey',
  'gmailclientsecret',
  'gmailrefreshtoken',
  'smsapikey',
  'whatsappapikey',
]);

@Injectable()
export class EventLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventLoggingInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, headers, ip } = request;

    if (!MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    const user = request.user;

    // orgId can come from:
    // 1. Route param (/organizations/:orgId/...)
    // 2. A custom property set by middleware
    // 3. x-org-id header
    const orgId =
      params?.orgId ||
      request.orgId ||
      headers?.['x-org-id'];

    const ipAddress =
      (headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      ip ||
      null;

    const userAgent = (headers?.['user-agent'] as string | undefined) ?? null;

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // Fire-and-forget — never blocks the response
          this.logEvent({
            action: this.resolveAction(method),
            entity: this.resolveEntity(url),
            entityId: this.resolveEntityId(url, responseData),
            userId: user?.id ? Number(user.id) : undefined,
            orgId: orgId ? Number(orgId) : undefined,
            ipAddress,
            userAgent,
            metadata: {
              method,
              url,
              body: this.sanitizeBody(body),
            },
          }).catch((error) => {
            this.logger.error(
              `Failed to create audit log: ${(error as Error).message}`,
              (error as Error).stack,
            );
          });
        },
      }),
    );
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async logEvent(data: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: number;
    orgId?: number;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (!data.orgId) {
      this.logger.debug('Audit log skipped: orgId is required');
      return;
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          resourceType: data.entity,
          resourceId: data.entityId ? Number(data.entityId) || null : null,
          userId: data.userId ?? null,
          orgId: data.orgId,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          metadata: data.metadata
            ? JSON.parse(JSON.stringify(data.metadata))
            : undefined,
        },
      });
    } catch (error) {
      // Never throw — audit logging must not affect the main request
      this.logger.warn(
        `Audit log write failed: ${(error as Error).message}`,
      );
    }
  }

  /** POST → CREATE, PATCH/PUT → UPDATE, DELETE → DELETE */
  private resolveAction(method: string): string {
    const map: Record<string, string> = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };
    return map[method] ?? 'UNKNOWN';
  }

  /**
   * Walk the URL segments backwards and return the first non-ID segment.
   * /api/v1/organizations/123/projects/456  →  "projects"
   * /api/v1/organizations/123/projects      →  "projects"
   */
  private resolveEntity(url: string): string {
    // Strip query string
    const path = url.split('?')[0];
    const segments = path.split('/').filter(Boolean);

    const SKIP = new Set(['api', 'v1', 'v2', 'v3']);
    const ID_RE = /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      if (!ID_RE.test(seg) && !SKIP.has(seg)) {
        return seg;
      }
    }
    return 'unknown';
  }

  /**
   * Try to resolve the affected resource ID:
   * 1. From response body (data.id or id)
   * 2. From the last numeric/UUID segment of the URL (for UPDATE/DELETE)
   */
  private resolveEntityId(
    url: string,
    responseData: unknown,
  ): string | undefined {
    const data = responseData as Record<string, any> | null | undefined;

    if (data?.id) return String(data.id);
    if (data?.data?.id) return String(data.data.id);

    const path = url.split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1];

    const ID_RE = /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    if (last && ID_RE.test(last)) return last;

    return undefined;
  }

  /** Replace values of sensitive keys with "[REDACTED]". */
  private sanitizeBody(body: unknown): Record<string, any> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return {};

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(body as Record<string, any>)) {
      sanitized[key] = SENSITIVE_KEYS.has(key.toLowerCase())
        ? '[REDACTED]'
        : value;
    }
    return sanitized;
  }
}
