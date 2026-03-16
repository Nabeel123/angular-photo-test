import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG, API_CONFIG_TOKEN } from '@app/core';
import { PhotoApiService } from './photo-api.service';
import { PicsumPhoto } from '../models/photo.model';

const mockRaw: PicsumPhoto = {
  id: '42',
  author: 'John Doe',
};

describe('PhotoApiService', () => {
  let service: PhotoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG_TOKEN, useValue: API_CONFIG },
      ],
    });
    service = TestBed.inject(PhotoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch and map a list of photos', async () => {
    const resultPromise = firstValueFrom(service.getPhotos(1));

    const req = httpMock.expectOne((request) => request.url.includes('/v2/list'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('12');
    req.flush([mockRaw]);

    const result = await resultPromise;

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('42');
    expect(result[0].author).toBe('John Doe');
    expect(result[0].imageUrl).toBe('https://picsum.photos/id/42/200/300');
    expect(result[0].imageWidth).toBe(200);
    expect(result[0].imageHeight).toBe(300);
  });

  it('should fetch and map a single photo by id', async () => {
    const resultPromise = firstValueFrom(service.getPhotoById('42'));

    const req = httpMock.expectOne((request) => request.url.includes('/id/42/info'));
    req.flush(mockRaw);

    const result = await resultPromise;

    expect(result.id).toBe('42');
    expect(result.imageUrl).toBe('https://picsum.photos/id/42/200/300');
    expect(result.imageWidth).toBe(200);
    expect(result.imageHeight).toBe(300);
  });

  it('should use larger dimensions for detail view when useDetailSize is true', async () => {
    const resultPromise = firstValueFrom(service.getPhotoById('42', true));

    const req = httpMock.expectOne((request) => request.url.includes('/id/42/info'));
    req.flush(mockRaw);

    const result = await resultPromise;

    expect(result.id).toBe('42');
    expect(result.imageUrl).toBe('https://picsum.photos/id/42/1000/667');
    expect(result.imageWidth).toBe(1000);
    expect(result.imageHeight).toBe(667);
  });
});
