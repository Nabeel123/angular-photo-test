import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { API_CONFIG_TOKEN, Photo, PhotoApiService } from '@app/core';

/** Pre-fetches the first page for faster LCP. Component uses result or fetches on its own. */
export const photosResolver: ResolveFn<Photo[] | null> = () => {
  const config = inject(API_CONFIG_TOKEN);
  return inject(PhotoApiService)
    .getPhotos(1, config.picsum.initialPageLimit)
    .pipe(
      catchError((err) => {
        console.error('Photos resolver failed', err);
        return of(null);
      })
    );
};
