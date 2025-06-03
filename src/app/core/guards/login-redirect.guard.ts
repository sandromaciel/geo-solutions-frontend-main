// login-redirect.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { jwtDecode } from 'jwt-decode';

import { AuthService } from '../services/auth.service';

export const loginRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const token = authService.getToken();

  if (token) {
    try {
      const decoded: { role: string } = jwtDecode(token);

      decoded.role.toLowerCase() === 'admin'
        ? router.navigate(['/admin'])
        : router.navigate(['/about']);

      return false;
    } catch {
      authService.logout();
      router.navigate(['/auth']);

      return false;
    }
  }

  router.navigate(['/auth']);
  return false;
};
