import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { authRoutes } from './features/auth/auth.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { loginRedirectGuard } from './core/guards/login-redirect.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { UserLayoutComponent } from './core/layout/user-layout/user-layout.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: adminRoutes,
  },
  {
    path: '',
    pathMatch: 'prefix',
    component: UserLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth',
      },
      {
        path: 'auth',
        title: 'Autenticação',
        canActivate: [loginRedirectGuard],
        children: authRoutes,
      },
      {
        path: 'about',
        title: 'Sobre',
        loadComponent: () =>
          import('./features/common/about/about.component').then(
            (m) => m.AboutComponent
          ),
      },
      {
        path: 'user',
        title: 'Usuário',
        loadComponent: () =>
          import('./features/auth/components/update-user-form/update-user-form.component').then(
            (m) => m.UpdateUserFormComponent
          ),
      },
      {
        path: 'services',
        title: 'Serviços',
        loadComponent: () =>
          import('./features/common/services/services.component').then(
            (m) => m.ServicesComponent
          ),
      },

      {
        path: 'budget',

        loadComponent: () =>
         import('./features/common/budget/budget.component').then(
            (m) => m.BudgetComponent
          ),
     },
     {
       path: 'budget/:id',
       loadComponent: () =>
         import('./features/common/budget/budget.component').then(
           (m) => m.BudgetComponent
         ),
     },
      {
        path: 'configurations',
        loadComponent: () =>
          import('./features/admin/configurations/configurations.component').then(
            (m) => m.ConfigurationsComponent
          ),
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
