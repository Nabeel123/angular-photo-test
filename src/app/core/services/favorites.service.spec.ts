import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG, API_CONFIG_TOKEN, FavoritesService } from '@app/core';
import { createMockPhoto } from '../testing/photo-test-data';

const mockPhoto = createMockPhoto();
const mockPhoto2 = createMockPhoto({ id: '2', imageUrl: 'https://picsum.photos/id/2/200/300' });

describe('FavoritesService', () => {
  beforeEach(() => {
    localStorage.removeItem(API_CONFIG.favoritesStorageKey);
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: API_CONFIG_TOKEN, useValue: API_CONFIG },
      ],
    });
  });

  it('should start empty when storage is empty', () => {
    const service = TestBed.inject(FavoritesService);
    expect(service.favorites()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('should hydrate from storage on init', () => {
    localStorage.setItem(API_CONFIG.favoritesStorageKey, JSON.stringify([mockPhoto]));
    const service = TestBed.inject(FavoritesService);
    expect(service.favorites()).toEqual([mockPhoto]);
    expect(service.count()).toBe(1);
  });

  it('should hydrate from old { ids, entities } format', () => {
    localStorage.setItem(API_CONFIG.favoritesStorageKey, JSON.stringify({ ids: ['1'], entities: { '1': mockPhoto } }));
    const service = TestBed.inject(FavoritesService);
    expect(service.favorites()).toEqual([mockPhoto]);
    expect(service.count()).toBe(1);
  });

  it('should add a favorite', () => {
    const service = TestBed.inject(FavoritesService);
    service.addFavorite(mockPhoto);
    expect(service.favorites()).toEqual([mockPhoto]);
    expect(service.count()).toBe(1);
    expect(JSON.parse(localStorage.getItem(API_CONFIG.favoritesStorageKey)!)).toEqual([mockPhoto]);
  });

  it('should not duplicate when adding same photo twice', () => {
    const service = TestBed.inject(FavoritesService);
    service.addFavorite(mockPhoto);
    service.addFavorite(mockPhoto);
    expect(service.count()).toBe(1);
  });

  it('should remove a favorite', () => {
    const service = TestBed.inject(FavoritesService);
    service.addFavorite(mockPhoto);
    service.removeFavorite(mockPhoto.id);
    expect(service.favorites()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('should toggle add', () => {
    const service = TestBed.inject(FavoritesService);
    service.toggleFavorite(mockPhoto);
    expect(service.favoriteIds().has(mockPhoto.id)).toBe(true);
  });

  it('should toggle remove', () => {
    const service = TestBed.inject(FavoritesService);
    service.addFavorite(mockPhoto);
    service.toggleFavorite(mockPhoto);
    expect(service.favoriteIds().has(mockPhoto.id)).toBe(false);
  });

  it('favoriteIds should not contain unknown id', () => {
    const service = TestBed.inject(FavoritesService);
    expect(service.favoriteIds().has('999')).toBe(false);
  });

  it('should maintain insertion order', () => {
    const service = TestBed.inject(FavoritesService);
    service.addFavorite(mockPhoto);
    service.addFavorite(mockPhoto2);
    expect(service.favorites().map((photo) => photo.id)).toEqual(['1', '2']);
  });

  it('should handle malformed storage data safely', () => {
    localStorage.setItem(API_CONFIG.favoritesStorageKey, 'not valid json');
    const service = TestBed.inject(FavoritesService);
    expect(service.favorites()).toEqual([]);
  });
});
