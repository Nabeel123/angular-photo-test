import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { API_CONFIG_TOKEN, Photo, PhotoApiService } from '@app/core';

/** Manages paginated photo list state: fetch, load more, retry. Single responsibility for list data. */
@Injectable()
export class PhotoListStateService {
  private readonly photoApi = inject(PhotoApiService);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _photos = signal<Photo[]>([]);
  private readonly _page = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _hasMore = signal(true);
  private readonly _error = signal<string | null>(null);

  readonly photos = this._photos.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly hasMore = this._hasMore.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isEmpty = computed(() => this._photos().length === 0 && !this._isLoading());
  readonly hasError = computed(() => this._error() != null);

  fetchPage(): void {
    const nextPage = this._page() + 1;
    const limit =
      nextPage === 1 ? this.config.picsum.initialPageLimit : this.config.picsum.pageLimit;

    this._isLoading.set(true);
    this._error.set(null);

    this.photoApi
      .getPhotos(nextPage, limit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newPhotos) => {
          this._photos.update((prev) => [...prev, ...newPhotos]);
          this._page.set(nextPage);
          this._isLoading.set(false);
          this._hasMore.set(newPhotos.length > 0);
        },
        error: () => {
          this._isLoading.set(false);
          this._error.set('Failed to load photos. Please try again.');
        },
      });
  }

  retry(): void {
    this._error.set(null);
    this.fetchPage();
  }

  loadMore(): void {
    if (!this._isLoading() && this._hasMore()) this.fetchPage();
  }

  setPreloaded(photos: Photo[]): void {
    if (photos.length > 0) {
      this._photos.set(photos);
      this._page.set(1);
    } else {
      this.fetchPage();
    }
  }
}
