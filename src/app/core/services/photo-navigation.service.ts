import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Photo } from '../models/photo.model';

/** Centralized photo-related navigation. Single place for route paths and navigation logic. */
@Injectable({ providedIn: 'root' })
export class PhotoNavigationService {
  private readonly router = inject(Router);

  private readonly routes = {
    stream: '/',
    favorites: '/favorites',
    photo: (id: string) => `/photos/${id}`,
  } as const;

  navigateToPhoto(photo: Photo): void {
    void this.router.navigate([this.routes.photo(photo.id)]);
  }

  /** Back from detail view: to favorites if photo is favorited, else stream. */
  navigateBackFromDetail(isFavorite: boolean): void {
    void this.router.navigate([isFavorite ? this.routes.favorites : this.routes.stream]);
  }
}
