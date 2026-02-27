/**
 * A standardized wrapper for service-layer return values.
 * Useful when services need to communicate success/failure
 * alongside optional messages without throwing exceptions.
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  errors?: string[];
}

/**
 * Helper to create a successful ServiceResponse.
 */
export function serviceSuccess<T>(
  data: T,
  message?: string,
): ServiceResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Helper to create a failed ServiceResponse.
 */
export function serviceError<T = null>(
  message: string,
  errors?: string[],
): ServiceResponse<T> {
  return {
    success: false,
    data: null,
    message,
    errors,
  };
}
