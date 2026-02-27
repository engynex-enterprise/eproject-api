import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Indicates if the request was successful', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response payload' })
  data: T;

  @ApiPropertyOptional({ description: 'Optional message', example: 'Operation completed successfully' })
  message?: string;

  @ApiProperty({ description: 'ISO 8601 timestamp', example: '2026-01-15T10:30:00.000Z' })
  timestamp: string;

  constructor(data: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Factory for a successful response.
   */
  static ok<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto<T>(data, message);
  }

  /**
   * Factory for an error response.
   */
  static error<T = null>(message: string, data?: T): ApiResponseDto<T | null> {
    const response = new ApiResponseDto<T | null>(data ?? null, message);
    response.success = false;
    return response;
  }
}
