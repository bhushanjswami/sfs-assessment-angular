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

  constructor() { }

  // Intercept HTTP requests and handle errors
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(

      catchError((error: HttpErrorResponse) => {

        if (error.status === 0) {
        alert('Network error. Please check your internet connection.');
      } else if (error.status === 400) {
        alert('Bad request. Please verify the submitted data.');
      } else if (error.status === 408) {
        alert('Request timeout. Please try again.');
      } else if (error.status === 500) {
        alert('Internal server error.');
      } else if (error.status === 502) {
        alert('Bad gateway.');
      } else if (error.status === 503) {
        alert('Service unavailable. Please try again later.');
      } else {
        alert(`Unexpected error occurred. Status: ${error.status}`);
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: error.message,
        url: error.url
      });


        return throwError(() => error);
      })
    );
  }
}
