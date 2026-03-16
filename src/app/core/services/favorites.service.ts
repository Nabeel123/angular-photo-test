import { computed, inject, Injectable, signal } from '@angular/core';
import { Photo } from '../models/photo.model';
import { API_CONFIG_TOKEN } from '../config/api.config';

/** Validates that a value from JSON has the required Photo fields. */
function isPhoto(candidate: unknown): candidate is Photo {
  return (
    candidate != null &&
    typeof candidate === 'object' &&
    typeof (candidate as Photo).id === 'string' &&
    typeof (candidate as Photo).author === 'string' &&
    typeof (candidate as Photo).imageUrl === 'string' &&
    typeof (candidate as Photo).imageWidth === 'number' &&
    typeof (candidate as Photo).imageHeight === 'number'
  );
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

  private load(): Photo[] {
    try {
      const raw = localStorage.getItem(this.config.favoritesStorageKey);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(isPhoto);
      }
      // Legacy { ids: string[], entities: Record<string, unknown> } format
      if (
        parsed != null &&
        typeof parsed === 'object' &&
        'ids' in parsed &&
        'entities' in parsed &&
        Array.isArray((parsed as { ids: unknown }).ids)
      ) {
        const { ids, entities } = parsed as { ids: string[]; entities: Record<string, unknown> };
        return ids.map((id) => entities[id]).filter(isPhoto);
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
