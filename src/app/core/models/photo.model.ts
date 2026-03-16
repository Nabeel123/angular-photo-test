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
