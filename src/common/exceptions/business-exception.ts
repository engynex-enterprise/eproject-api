import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionCode } from './exception-codes.js';

export class BusinessException extends HttpException {
  public readonly code: ExceptionCode;

  constructor(
    code: ExceptionCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
  ) {
    super(
      {
        success: false,
        statusCode,
        code,
        message,
        error: 'BusinessException',
        ...(details && { details }),
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
    this.code = code;
  }

  /**
   * Factory: resource not found.
   */
  static notFound(
    resource: string,
    code: ExceptionCode = ExceptionCode.RESOURCE_NOT_FOUND,
  ): BusinessException {
    return new BusinessException(
      code,
      `${resource} not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  /**
   * Factory: resource already exists (conflict).
   */
  static conflict(
    message: string,
    code: ExceptionCode = ExceptionCode.RESOURCE_ALREADY_EXISTS,
  ): BusinessException {
    return new BusinessException(code, message, HttpStatus.CONFLICT);
  }

  /**
   * Factory: forbidden operation.
   */
  static forbidden(
    message: string,
    code: ExceptionCode = ExceptionCode.AUTH_INSUFFICIENT_PERMISSIONS,
  ): BusinessException {
    return new BusinessException(code, message, HttpStatus.FORBIDDEN);
  }

  /**
   * Factory: validation error.
   */
  static validation(
    message: string,
    details?: any,
  ): BusinessException {
    return new BusinessException(
      ExceptionCode.VALIDATION_FAILED,
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}
