import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import {
  FavoritesService,
  Photo,
  PhotoListStateService,
  PhotoNavigationService,
} from '@app/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  InfiniteScrollDirective,
  PhotoCardComponent,
} from '@app/shared';

/** Infinite-scrollable photo grid with preload from resolver. */
@Component({
  selector: 'app-photo-stream',
  imports: [
    PhotoCardComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    InfiniteScrollDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-stream.component.html',
  styleUrl: './photo-stream.component.scss',
  providers: [PhotoListStateService],
})
export class PhotoStreamComponent {
  readonly listState = inject(PhotoListStateService);
  readonly favoritesService = inject(FavoritesService);
  readonly photoNav = inject(PhotoNavigationService);

  /** Bound from the `photos` resolver key via `withComponentInputBinding()`. */
  readonly photos = input<Photo[] | null>(null);

  readonly skeletonPlaceholders = [1, 2, 3, 4] as const;

  private readonly _ = effect(() => this.listState.setPreloaded(this.photos() ?? []));

  retry(): void {
    this.listState.retry();
  }

  loadMore(): void {
    this.listState.loadMore();
  }

  onFavoriteToggled(photo: Photo): void {
    this.favoritesService.toggleFavorite(photo);
  }

  onCardClicked(photo: Photo): void {
    this.photoNav.navigateToPhoto(photo);
  }
}
