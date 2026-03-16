import { Routes } from '@angular/router';
import { photosResolver } from './features/photo-stream/photos.resolver';

export const routes: Routes = [
  {
    path: '',
    resolve: { photos: photosResolver },
    loadComponent: () =>
      import('./features/photo-stream/photo-stream.component').then(
        (m) => m.PhotoStreamComponent
      ),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (m) => m.FavoritesComponent
      ),
  },
  {
    path: 'photos/:id',
    loadComponent: () =>
      import('./features/photo-detail/photo-detail.component').then(
        (m) => m.PhotoDetailComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
