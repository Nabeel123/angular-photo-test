import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { LegacyFavoritesState, Photo, StoredFavoritesData, StoredPhoto } from '../models/photo.model';
import { API_CONFIG_TOKEN } from '../config/api.config';

/** Validates that a value from JSON has the required Photo fields. */
function isStoredPhoto(candidate: StoredPhoto | null | undefined): candidate is StoredPhoto {
  return (
    candidate != null &&
    typeof candidate === 'object' &&
    typeof candidate.id === 'string' &&
    typeof candidate.author === 'string' &&
    typeof candidate.imageUrl === 'string'
  );
}

/** Ensures imageWidth/imageHeight exist, parsing from URL if missing (legacy data). */
function normalizePhoto(
  storedPhoto: StoredPhoto,
  defaults: { imageWidth: number; imageHeight: number }
): Photo {
  if (storedPhoto.imageWidth != null && storedPhoto.imageHeight != null) {
    return storedPhoto as Photo;
  }
  const dimensionMatch = storedPhoto.imageUrl.match(/\/\d+\/(\d+)\/(\d+)(?:\?|$)/);
  const imageWidth = dimensionMatch
    ? parseInt(dimensionMatch[1], 10)
    : defaults.imageWidth;
  const imageHeight = dimensionMatch
    ? parseInt(dimensionMatch[2], 10)
    : defaults.imageHeight;
  return { ...storedPhoto, imageWidth, imageHeight };
}

/** Manages favorite photos with localStorage persistence. */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly _photos = signal<Photo[]>(this.load());

  readonly favorites = this._photos.asReadonly();
  readonly count = computed(() => this._photos().length);

  /** Set of favorited photo IDs for O(1) membership checks. */
  readonly favoriteIds = computed(() => new Set(this._photos().map((p) => p.id)));

  addFavorite(photo: Photo): void {
    this._photos.update((current) => {
      if (current.some((existing) => existing.id === photo.id)) return current;
      const updated = [...current, photo];
      this.save(updated);
      return updated;
    });
  }

  removeFavorite(photoId: string): void {
    this._photos.update((current) => {
      const updated = current.filter((p) => p.id !== photoId);
      this.save(updated);
      return updated;
    });
  }

  toggleFavorite(photo: Photo): void {
    if (this.favoriteIds().has(photo.id)) {
      this.removeFavorite(photo.id);
    } else {
      this.addFavorite(photo);
    }
  }

  /** Load from localStorage. Supports current format (Photo[]) and legacy { ids, entities }. */
  private load(): Photo[] {
    try {
      const raw = localStorage.getItem(this.config.favoritesStorageKey);
      if (!raw) return [];
      const parsed: StoredFavoritesData = JSON.parse(raw);
      const defaults = this.config.picsum;
      if (Array.isArray(parsed)) {
        return parsed.filter(isStoredPhoto).map((p) => normalizePhoto(p, defaults));
      }
      // Migrate from old { ids, entities } format
      if (parsed && 'ids' in parsed && 'entities' in parsed) {
        const legacyState = parsed as LegacyFavoritesState;
        return (legacyState.ids || [])
          .map((photoId) => legacyState.entities?.[photoId])
          .filter(isStoredPhoto)
          .map((p) => normalizePhoto(p, defaults));
      }
      return [];
    } catch {
      return [];
    }
  }

  private save(photos: Photo[]): void {
    try {
      localStorage.setItem(this.config.favoritesStorageKey, JSON.stringify(photos));
    } catch {
      // Quota exceeded or storage unavailable — fail silently
    }
  }
}
