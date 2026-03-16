import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PhotoDetailComponent } from './photo-detail.component';
import { FavoritesService, PhotoApiService } from '@app/core';
import { createMockPhoto } from '@app/core/testing/photo-test-data';

const mockPhoto = createMockPhoto({ id: '42' });

describe('PhotoDetailComponent', () => {
  let photoApiSpy: { getPhotoById: ReturnType<typeof vi.fn> };
  let favoritesSpy: {
    favoriteIds: ReturnType<typeof signal<Set<string>>>;
    toggleFavorite: ReturnType<typeof vi.fn>;
    removeFavorite: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof signal<number>>;
  };

  beforeEach(() => {
    photoApiSpy = { getPhotoById: vi.fn().mockReturnValue(of(mockPhoto)) };
    favoritesSpy = {
      favoriteIds: signal(new Set(['42'])),
      toggleFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      count: signal(0),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PhotoApiService, useValue: photoApiSpy },
        { provide: FavoritesService, useValue: favoritesSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '42' } },
            params: of({ id: '42' }),
          },
        },
      ],
    });
  });

  it('should load photo on init', async () => {
    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(photoApiSpy.getPhotoById).toHaveBeenCalledWith('42', true);
    expect(fixture.componentInstance.photo()).toEqual(mockPhoto);
  });

  it('should show error state on API failure', async () => {
    photoApiSpy.getPhotoById.mockReturnValue(throwError(() => new Error('Not found')));
    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBeTruthy();
  });

  it('should call toggleFavorite when toggling favorite', async () => {
    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.componentInstance.toggleFavorite();
    expect(favoritesSpy.toggleFavorite).toHaveBeenCalledWith(mockPhoto);
  });

  it('should navigate to /favorites when goBack and photo is favorited', async () => {
    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    fixture.componentInstance.goBack();
    expect(navSpy).toHaveBeenCalledWith(['/favorites']);
  });

  it('should navigate to / when no id param', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: { paramMap: { get: () => null } },
        params: of({ id: null }),
      },
    });
    const fixture = TestBed.createComponent(PhotoDetailComponent);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    fixture.detectChanges();
    expect(navSpy).toHaveBeenCalledWith(['/']);
  });
});
