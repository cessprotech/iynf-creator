import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class MSInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    return next.handle().pipe(
      map(result => {
        // Handle or process the result here
        return {
          status: true,
          data: result,
          error: null
        }
      }),
      catchError(error => {
        // Handle or process the error here
        console.error('Error occurred:', error);
        return of({
          status: false,
          data: null,
          error: error.message
        })
      })
    );
  }
}
