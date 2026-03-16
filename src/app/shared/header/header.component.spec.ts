import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { HeaderComponent } from './header.component';
import { FavoritesService } from '@app/core';

describe('HeaderComponent', () => {
  const mockFavoritesService = {
    count: signal(0),
    favorites: signal([]),
    favoriteIds: signal(new Set<string>()),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: mockFavoritesService },
      ],
    });
  });

  it('should render Photos and Favorites links', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const html = fixture.nativeElement.textContent ?? '';
    expect(html).toContain('Photos');
    expect(html).toContain('Favorites');
  });

  it('should show badge when favorites count > 0', () => {
    mockFavoritesService.count.set(3);
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.app-header__badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('should have nav landmark', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeTruthy();
  });

  it('should highlight Photos when on photo detail route (non-favorited photo)', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'photos/:id', component: HeaderComponent }]),
        { provide: FavoritesService, useValue: mockFavoritesService },
      ],
    });
    const fixture = TestBed.createComponent(HeaderComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/photos/123');
    fixture.detectChanges();
    expect(fixture.componentInstance.isPhotosViewActive()).toBe(true);
    expect(fixture.componentInstance.isFavoritesViewActive()).toBe(false);
  });

  it('should highlight Favorites when on photo detail route (favorited photo)', async () => {
    const favoritedMock = {
      ...mockFavoritesService,
      favoriteIds: signal(new Set(['123'])),
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'photos/:id', component: HeaderComponent }]),
        { provide: FavoritesService, useValue: favoritedMock },
      ],
    });
    const fixture = TestBed.createComponent(HeaderComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/photos/123');
    fixture.detectChanges();
    expect(fixture.componentInstance.isPhotosViewActive()).toBe(false);
    expect(fixture.componentInstance.isFavoritesViewActive()).toBe(true);
  });
});
