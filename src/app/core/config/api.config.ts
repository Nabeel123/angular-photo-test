import { InjectionToken } from '@angular/core';

export const API_CONFIG = {
  picsum: {
    baseUrl: 'https://picsum.photos',
    initialPageLimit: 4,
    pageLimit: 12,
    imageWidth: 200,
    imageHeight: 300,
    detailImageWidth: 1000,
    detailImageHeight: 667,
  },
  favoritesStorageKey: 'piktiv_favorites_v1',
} as const;

export type ApiConfig = typeof API_CONFIG;

export const API_CONFIG_TOKEN = new InjectionToken<ApiConfig>('API_CONFIG');
