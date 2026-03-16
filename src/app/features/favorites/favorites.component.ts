import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService, Photo, PhotoNavigationService } from '@app/core';
import { PhotoCardComponent } from '@app/shared';

@Component({
  selector: 'app-favorites',
  imports: [
    PhotoCardComponent,
    RouterLink,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  readonly favoritesService = inject(FavoritesService);
  readonly photoNav = inject(PhotoNavigationService);

  readonly favorites = this.favoritesService.favorites;
  readonly isEmpty = computed(() => this.favorites().length === 0);

  onCardClicked(photo: Photo): void {
    this.photoNav.navigateToPhoto(photo);
  }

  onFavoriteToggled(photo: Photo): void {
    this.favoritesService.toggleFavorite(photo);
  }
}
