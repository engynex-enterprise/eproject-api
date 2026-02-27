import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Extracts the organization (tenant) context from either the authenticated
 * user's JWT payload or the X-Org-Id header and attaches it to the request.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    // Priority 1: orgId from the authenticated user's JWT payload
    const user = (req as any).user;
    if (user?.orgId) {
      (req as any).orgId = user.orgId;
      next();
      return;
    }

    // Priority 2: orgId from the X-Org-Id header
    const headerOrgId = req.headers['x-org-id'] as string | undefined;
    if (headerOrgId) {
      (req as any).orgId = headerOrgId;
      next();
      return;
    }

    // Priority 3: orgId from route params (e.g., /orgs/:orgId/...)
    const paramOrgId = req.params?.orgId;
    if (paramOrgId) {
      (req as any).orgId = paramOrgId;
    }

    next();
  }
}
