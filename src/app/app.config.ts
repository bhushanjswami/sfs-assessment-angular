import {
  ApplicationConfig,
  APP_INITIALIZER
} from '@angular/core';

import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ConfigService } from './services/config.service';

// Factory function to load configuration before app initialization
export function loadConfiguration(
  configService: ConfigService
) {
  return () =>
    firstValueFrom(
      configService.loadConfig()
    ).then(config => {
      configService.setConfig(config);
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    {
      provide: APP_INITIALIZER,
      useFactory: loadConfiguration,
      deps: [ConfigService],
      multi: true
    }
  ]
};
