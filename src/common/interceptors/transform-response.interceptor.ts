import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformedResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        // If response is already in the wrapped format, return as-is
        if (
          responseData &&
          typeof responseData === 'object' &&
          'success' in responseData &&
          'data' in responseData
        ) {
          return responseData as TransformedResponse<T>;
        }

        // If response contains pagination meta, separate it
        if (
          responseData &&
          typeof responseData === 'object' &&
          'data' in responseData &&
          'meta' in responseData
        ) {
          return {
            success: true,
            data: responseData.data,
            meta: responseData.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
