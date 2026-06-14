import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  // Intercept HTTP requests and handle errors
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('inside http interceptor')
     return next.handle(request).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status === 404) {
        alert('Resource not found');
      }

      if (error.status === 500) {
        alert('Server error');
      }

      return throwError(() => error);
    })
  );
  }
}
