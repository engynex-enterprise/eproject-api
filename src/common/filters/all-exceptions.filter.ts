import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  details?: any;
  path: string;
  timestamp: string;
  correlationId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, any>;
        message = resp.message || exception.message;
        error = resp.error || error;
        details = resp.details || undefined;

        // Handle class-validator errors (array of messages)
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          details = resp.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name || 'InternalServerError';
    }

    // Log the error
    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${statusCode} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${statusCode} - ${message}`,
      );
    }

    const correlationId = request.headers['x-correlation-id'] as
      | string
      | undefined;

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode,
      message,
      error,
      ...(details && { details }),
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(correlationId && { correlationId }),
    };

    response.status(statusCode).json(errorResponse);
  }
}
