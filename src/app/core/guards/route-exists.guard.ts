import { inject } from '@angular/core';
import { CanActivateFn, Route, Router } from '@angular/router';

const findRoute = (path: string, routes: Route[]): boolean => {
  for (const route of routes) {
    if (route.path === path) {
      return true;
    }

    if (route.children) {
      if (findRoute(path, route.children)) {
        return true;
      }
    }
  }
  return false;
};

export const routeExistsGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const url = state.url.replace(/^\//, '');
  const routeExists = findRoute(url, router.config);

  return routeExists ? true : router.createUrlTree(['/not-found']);
};
