import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService } from '@app/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly favoritesService = inject(FavoritesService);

  /** Reactive URL so header updates when navigating (e.g. back from detail → favorites). */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly isPhotosViewActive = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/favorites')) return false;
    if (/^\/photos\/[^/]+$/.test(url)) {
      const id = url.match(/^\/photos\/([^/]+)$/)?.[1];
      if (id && this.favoritesService.favoriteIds().has(id)) return false;
      return true;
    }
    return url === '/';
  });

  readonly isFavoritesViewActive = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/favorites')) return true;
    if (/^\/photos\/[^/]+$/.test(url)) {
      const id = url.match(/^\/photos\/([^/]+)$/)?.[1];
      return !!(id && this.favoritesService.favoriteIds().has(id));
    }
    return false;
  });
}
