import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { PhotoStreamComponent } from './photo-stream.component';
import { API_CONFIG, API_CONFIG_TOKEN, FavoritesService, Photo, PhotoApiService } from '@app/core';
import { createMockPhoto } from '@app/core/testing/photo-test-data';

const mockPhoto = createMockPhoto();

describe('PhotoStreamComponent', () => {
  let photoApiSpy: { getPhotos: ReturnType<typeof vi.fn> };
  let favoritesSpy: {
    toggleFavorite: ReturnType<typeof vi.fn>;
    addFavorite: ReturnType<typeof vi.fn>;
    favoriteIds: ReturnType<typeof signal<Set<string>>>;
    favorites: ReturnType<typeof signal<Photo[]>>;
    count: ReturnType<typeof signal<number>>;
  };

  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (
        this: object,
        _cb: IntersectionObserverCallback,
        _opts?: IntersectionObserverInit
      ) {
        return { observe: vi.fn(), disconnect: vi.fn() };
      })
    );
    photoApiSpy = { getPhotos: vi.fn().mockReturnValue(of([mockPhoto])) };
    favoritesSpy = {
      toggleFavorite: vi.fn(),
      addFavorite: vi.fn(),
      favoriteIds: signal(new Set<string>()),
      favorites: signal<Photo[]>([]),
      count: signal(0),
    };

    TestBed.configureTestingModule({
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: API_CONFIG_TOKEN, useValue: API_CONFIG },
        { provide: PhotoApiService, useValue: photoApiSpy },
        { provide: FavoritesService, useValue: favoritesSpy },
      ],
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('should call fetchPage on init when no preloaded photos', async () => {
    const fixture = TestBed.createComponent(PhotoStreamComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(photoApiSpy.getPhotos).toHaveBeenCalledWith(1, 4);
  });

  it('should render photo cards after load', async () => {
    const fixture = TestBed.createComponent(PhotoStreamComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-photo-card');
    expect(cards.length).toBe(1);
  });

  it('should not load more when already loading', () => {
    const subject = new Subject<typeof mockPhoto[]>();
    photoApiSpy.getPhotos.mockReturnValue(subject.asObservable());
    const fixture = TestBed.createComponent(PhotoStreamComponent);
    fixture.detectChanges();
    fixture.componentInstance.loadMore(); // called again while first is in progress
    expect(photoApiSpy.getPhotos).toHaveBeenCalledTimes(1);
    subject.next([mockPhoto]); // complete the first request
  });

  it('should show error state on API failure', async () => {
    photoApiSpy.getPhotos.mockReturnValue(throwError(() => new Error('Network error')));
    const fixture = TestBed.createComponent(PhotoStreamComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.listState.error()).toBeTruthy();
  });

  it('should call toggleFavorite when favoriteToggled emits', async () => {
    const fixture = TestBed.createComponent(PhotoStreamComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.onFavoriteToggled(mockPhoto);
    expect(favoritesSpy.toggleFavorite).toHaveBeenCalledWith(mockPhoto);
  });

  it('should use preloaded photos from resolver when available', () => {
    const fixture = TestBed.createComponent(PhotoStreamComponent);
    fixture.componentRef.setInput('photos', [mockPhoto]);
    fixture.detectChanges();
    expect(photoApiSpy.getPhotos).not.toHaveBeenCalled();
    expect(fixture.componentInstance.listState.photos()).toEqual([mockPhoto]);
  });

  it('should navigate to photo detail on card click', async () => {
    const fixture = TestBed.createComponent(PhotoStreamComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    fixture.componentInstance.onCardClicked(mockPhoto);
    expect(navSpy).toHaveBeenCalledWith(['/photos/1']);
  });
});
