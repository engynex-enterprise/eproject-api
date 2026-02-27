import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    // Set on request for downstream access
    req.headers['x-correlation-id'] = correlationId;

    // Set on response so the client can correlate
    res.setHeader('X-Correlation-Id', correlationId);

    next();
  }
}
