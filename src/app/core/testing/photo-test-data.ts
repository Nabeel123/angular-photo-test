import { Photo } from '../models/photo.model';

const defaults: Photo = {
  id: '1',
  author: 'Test Author',
  imageWidth: 200,
  imageHeight: 300,
  imageUrl: 'https://picsum.photos/id/1/200/300',
};

/** Create a mock Photo for tests. Override any fields via overrides. */
export function createMockPhoto(overrides: Partial<Photo> = {}): Photo {
  return { ...defaults, ...overrides };
}
