import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const publicEndpoints: { url: string; method?: string }[] = [
    { url: '/Users', method: 'POST' },
    { url: '/Users/login', method: 'POST' },
    { url: '/budget' },
    { url: '/Budgets' },
    { url: '/ServiceType' },
    { url: '/calc' },
    { url: 'https://viacep.com.br/ws' }, 
    { url: 'city/coverage' },
    { url: 'address' },
  ];

  const isPublicRequest = publicEndpoints.some(endpoint =>
    req.url.includes(endpoint.url) && (endpoint.method ? req.method === endpoint.method : true)
  );

  if (isPublicRequest) {
    if (req.url.includes('viacep.com.br')) {
      return next(req);
    }
    return next(req);
  }

  if (isPublicRequest) {
    return next(req);
  }

  const token = authService.getToken();
  let authReq = req;

  if (token && authService.isAuthenticated()) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.debug('Token is missing or expired');
    authService.logout();
    router.navigate(['/auth/signin'], {
      queryParams: { returnUrl: router.routerState.snapshot.url },
    });
    return throwError(() => new Error('Token is missing or expired'));
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.debug('Unauthorized request', error);
          authService.logout();
          router.navigate(['/auth/signin'], {
            queryParams: { returnUrl: router.routerState.snapshot.url },
          });
          return throwError(() => new Error('Unauthorized request'));
        }
        if (error.status === 403) {
          console.debug('Forbidden request', error);
          router.navigate(['/']);
          return throwError(() => new Error('Forbidden request'));
        }
      }
      return throwError(() => error);
    })
  );
};
