import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((exception: HttpException) => {
        if (exception instanceof HttpException) {
          const status_code = exception.getStatus();

          if (status_code === HttpStatus.INTERNAL_SERVER_ERROR) {
            Sentry.captureException(exception);
          }
        } else {
          // Handle other types of exceptions or errors here
          // For example, you can log or handle them differently
          Sentry.captureException(exception);
        }

        return throwError(() => exception);
      }),
    );
  }
}