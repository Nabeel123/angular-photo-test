import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { FavoritesComponent } from './favorites.component';
import { FavoritesService, Photo } from '@app/core';
import { createMockPhoto } from '@app/core/testing/photo-test-data';

const mockPhoto = createMockPhoto();

describe('FavoritesComponent', () => {
  let favoritesSpy: {
    favorites: ReturnType<typeof signal<Photo[]>>;
    count: ReturnType<typeof signal<number>>;
    favoriteIds: ReturnType<typeof signal<Set<string>>>;
    toggleFavorite: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    favoritesSpy = {
      favorites: signal<Photo[]>([]),
      count: signal<number>(0),
      favoriteIds: signal(new Set<string>()),
      toggleFavorite: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: FavoritesService, useValue: favoritesSpy },
      ],
    });
  });

  it('should show empty state when no favorites', () => {
    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No favorites yet');
  });

  it('should render photo cards when favorites exist', () => {
    favoritesSpy.favorites.set([mockPhoto]);
    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-photo-card');
    expect(cards.length).toBe(1);
  });

  it('should navigate to photo detail on card click', () => {
    favoritesSpy.favorites.set([mockPhoto]);
    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    fixture.componentInstance.onCardClicked(mockPhoto);
    expect(navSpy).toHaveBeenCalledWith(['/photos/1']);
  });

  it('should call toggleFavorite when favoriteToggled emits', () => {
    favoritesSpy.favorites.set([mockPhoto]);
    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    fixture.componentInstance.onFavoriteToggled(mockPhoto);
    expect(favoritesSpy.toggleFavorite).toHaveBeenCalledWith(mockPhoto);
  });
});
