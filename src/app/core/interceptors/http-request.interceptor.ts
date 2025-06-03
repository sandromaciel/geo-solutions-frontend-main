// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';

// import { AuthService } from '../services/auth.service';

// export const httpRequestInterceptor: HttpInterceptorFn = (req, next) => {
//   const isAuthRequest = req.url.includes('/auth/signin');

//   if (isAuthRequest) {
//     return next(req);
//   }

//   const authService = inject(AuthService);

//   if (!authService.isAuthenticated()) {
//     console.debug('Token is missing or expired');
//     authService.logout();

//     return next(req);
//   }

//   const token = authService.getToken();

//   req = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return next(req);
// };
