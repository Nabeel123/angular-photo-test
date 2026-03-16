import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FavoritesService, Photo, PhotoApiService, PhotoNavigationService } from '@app/core';
import { ImageLoadDirective } from '@app/shared';

/** Full-screen photo view with favorite toggle and back navigation. */
@Component({
  selector: 'app-photo-detail',
  imports: [NgOptimizedImage, MatButtonModule, MatIconModule, MatProgressSpinnerModule, ImageLoadDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
})
export class PhotoDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly photoApiService = inject(PhotoApiService);

  readonly favoritesService = inject(FavoritesService);
  readonly photoNav = inject(PhotoNavigationService);

  private readonly _imageLoaded = signal(false);
  readonly imageLoaded = this._imageLoaded.asReadonly();

  private readonly id = toSignal(
    this.route.params.pipe(map((p) => p['id'] as string | null)),
    { initialValue: this.route.snapshot.paramMap.get('id') }
  );

  /** Valid photo id for Picsum (numeric). Returns undefined for empty/invalid ids. */
  private readonly validPhotoId = computed(() => {
    const id = this.id();
    return id?.trim() && /^\d+$/.test(id) ? id : undefined;
  });

  private readonly photoResource = rxResource<Photo, string | undefined>({
    params: () => this.validPhotoId(),
    stream: ({ params: id }) => this.photoApiService.getPhotoById(id, true),
  });

  readonly photo = computed(() =>
    this.photoResource.error() != null ? null : (this.photoResource.value() ?? null)
  );
  readonly isLoading = computed(() => this.photoResource.isLoading());
  readonly error = computed(() =>
    this.photoResource.error() != null ? 'Photo not found.' : null
  );

  readonly isFavorite = computed(() => {
    const p = this.photo();
    return p ? this.favoritesService.favoriteIds().has(p.id) : false;
  });

  private readonly _navigateEffect = effect(() => {
    const id = this.id();
    if (id === null || (typeof id === 'string' && !id.trim())) {
      this.photoNav.navigateToStream();
    }
  });

  private readonly _resetImageEffect = effect(() => {
    this.photo();
    this._imageLoaded.set(false);
  });

  toggleFavorite(): void {
    const p = this.photo();
    if (p) this.favoritesService.toggleFavorite(p);
  }

  goBack(): void {
    this.photoNav.navigateBackFromDetail(this.isFavorite());
  }

  onImageLoad(): void {
    this._imageLoaded.set(true);
  }
}
