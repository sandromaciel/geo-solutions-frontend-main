import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRoute = state.url.startsWith('/auth');
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated && isAuthRoute) {
    return true;
  }

  if (isAuthenticated && isAuthRoute) {
    router.navigate(['/about']);
    return false;
  }

  if (isAuthenticated) {
    return true;
  }

  router.navigate(['/auth']);
  return false;
};
