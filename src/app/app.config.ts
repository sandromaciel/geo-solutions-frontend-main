import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { ToastService } from './core/services/toast.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    ToastService,
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(FormsModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
  ],
};
