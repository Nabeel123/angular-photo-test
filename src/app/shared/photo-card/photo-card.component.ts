import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Photo } from '@app/core';
import { ImageLoadDirective } from '@app/shared';

@Component({
  selector: 'app-photo-card',
  imports: [NgOptimizedImage, MatIconModule, ImageLoadDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-card.component.html',
  styleUrl: './photo-card.component.scss',
})
export class PhotoCardComponent {
  readonly photo = input.required<Photo>();
  readonly isFavorite = input<boolean>(false);
  readonly priority = input<boolean>(false);

  readonly imageLoaded = signal(false);

  readonly favoriteToggled = output<Photo>();
  readonly cardClicked = output<Photo>();

  private readonly _ = effect(() => {
    this.photo();
    this.imageLoaded.set(false);
  });

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  onCardClick(): void {
    this.cardClicked.emit(this.photo());
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteToggled.emit(this.photo());
  }
}
