import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogger');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const correlationId = req.headers['x-correlation-id'] || '-';
    const startTime = Date.now();

    this.logger.log(
      `[${correlationId}] --> ${method} ${originalUrl} - ${ip} ${userAgent}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      const logMethod =
        statusCode >= 500
          ? 'error'
          : statusCode >= 400
            ? 'warn'
            : 'log';

      this.logger[logMethod](
        `[${correlationId}] <-- ${method} ${originalUrl} ${statusCode} +${duration}ms`,
      );
    });

    next();
  }
}
