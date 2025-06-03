import { Route } from '@angular/router';

export const adminRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'variables',
    title: 'Variáveis',
    loadComponent: () =>
      import('./variables/variables.component').then(
        (m) => m.VariablesComponent
      ),
  },
  {
    path: 'regions',
    title: 'Regiões',
    loadComponent: () =>
      import('./regions/regions.component').then((m) => m.RegionsComponent),
  },
  {
    path: 'configurations',
    title: 'Configurações',
    loadComponent: () =>
      import('./configurations/configurations.component').then(
        (m) => m.ConfigurationsComponent
      ),
  },
  {
    path: 'service-manager',
    title: 'Gerenciador de Serviços',
    loadComponent: () =>
      import('./service-manager/service-manager.component').then(
        (m) => m.ServiceManagerComponent
      ),
  },
  {
  path: 'budget-reports',
  title: 'Orçamentos',
  loadComponent: () =>
    import('./budget-reports/budget-reports.component').then(
      (m) => m.BudgetReportsComponent
    ),
}
];
