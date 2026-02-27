import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.mapPrismaError(exception);

    this.logger.warn(
      `Prisma error [${exception.code}]: ${exception.message}`,
    );

    const correlationId = request.headers['x-correlation-id'] as
      | string
      | undefined;

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(correlationId && { correlationId }),
    });
  }

  private mapPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): { statusCode: number; message: string; error: string } {
    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = (exception.meta?.target as string[]) || [];
        const fields = target.join(', ');
        return {
          statusCode: HttpStatus.CONFLICT,
          message: fields
            ? `A record with this ${fields} already exists`
            : 'A record with these values already exists',
          error: 'UniqueConstraintViolation',
        };
      }

      case 'P2025':
        // Record not found
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message:
            (exception.meta?.cause as string) || 'The requested record was not found',
          error: 'RecordNotFound',
        };

      case 'P2003':
        // Foreign key constraint failed
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Related record not found. Please check your references.',
          error: 'ForeignKeyConstraintViolation',
        };

      case 'P2014':
        // Required relation violation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'The change you are trying to make would violate a required relation.',
          error: 'RequiredRelationViolation',
        };

      case 'P2021':
        // Table does not exist
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database table required for this operation does not exist.',
          error: 'TableNotFound',
        };

      case 'P2022':
        // Column does not exist
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A required database column does not exist.',
          error: 'ColumnNotFound',
        };

      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Database error: ${exception.code}`,
          error: 'DatabaseError',
        };
    }
  }
}
