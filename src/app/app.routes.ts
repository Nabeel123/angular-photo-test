import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    resolve: {
      photos: () =>
        import('./features/photo-stream/photos.resolver').then(
          (m) => m.photosResolver
        ),
    },
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
