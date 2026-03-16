import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { IMAGE_LOADER } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { API_CONFIG, API_CONFIG_TOKEN } from './core/config/api.config';

/** Pass-through loader for external URLs (e.g. picsum.photos) so ngSrc works correctly */
const externalImageLoader = (config: { src: string }) => config.src;

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    { provide: IMAGE_LOADER, useValue: externalImageLoader },
    { provide: API_CONFIG_TOKEN, useValue: API_CONFIG },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
  ]
};
