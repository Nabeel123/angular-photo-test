import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { API_CONFIG, API_CONFIG_TOKEN, Photo } from '@app/core';
import { photosResolver } from './photos.resolver';

const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = {} as RouterStateSnapshot;

describe('photosResolver', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG_TOKEN, useValue: API_CONFIG },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should resolve with first page of photos', async () => {
    const mockPhotos = [{ id: '0', author: 'Test' }];

    const result$ = TestBed.runInInjectionContext(() =>
      photosResolver(mockRoute, mockState)
    ) as Observable<Photo[] | null>;
    const photosPromise = firstValueFrom(result$);

    const req = httpMock.expectOne((request) => request.url.includes('/v2/list'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe(String(API_CONFIG.picsum.initialPageLimit));
    req.flush(mockPhotos);

    const photos = await photosPromise;
    expect(photos).toBeTruthy();
    expect(Array.isArray(photos)).toBe(true);
    expect(photos).not.toBeNull();
    expect(photos!.length).toBe(1);
    expect(photos![0].id).toBe('0');
  });

  it('should resolve with null on API error', async () => {
    const result$ = TestBed.runInInjectionContext(() =>
      photosResolver(mockRoute, mockState)
    ) as Observable<Photo[] | null>;
    const photosPromise = firstValueFrom(result$);

    const req = httpMock.expectOne((request) => request.url.includes('/v2/list'));
    req.flush('error', { status: 500, statusText: 'Server Error' });

    const photos = await photosPromise;
    expect(photos).toBeNull();
  });
});
