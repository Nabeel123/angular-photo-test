export interface PicsumPhoto {
  id: string;
  author: string;
}

export interface Photo {
  id: string;
  author: string;
  /** Dimensions of the loaded image (matches imageUrl); use for img width/height to avoid NgOptimizedImage aspect-ratio warnings */
  imageWidth: number;
  imageHeight: number;
  imageUrl: string;
}

/** Photo shape when loaded from localStorage (may lack imageWidth/imageHeight from older saves) */
export interface StoredPhoto extends Pick<Photo, 'id' | 'author' | 'imageUrl'> {
  imageWidth?: number;
  imageHeight?: number;
}

/** Legacy format for migration from older app versions */
export interface LegacyFavoritesState {
  ids: string[];
  entities: Record<string, StoredPhoto>;
}

/** JSON from localStorage - either current format or legacy */
export type StoredFavoritesData = StoredPhoto[] | LegacyFavoritesState;
