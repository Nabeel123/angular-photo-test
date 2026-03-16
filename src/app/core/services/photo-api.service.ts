import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Photo, PicsumPhoto } from '../models/photo.model';
import { API_CONFIG_TOKEN } from '../config/api.config';

/** Fetches and maps photos from the Picsum API. */
@Injectable({ providedIn: 'root' })
export class PhotoApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);

  getPhotos(
    page: number,
    limit: number = this.config.picsum.pageLimit
  ): Observable<Photo[]> {
    const { baseUrl } = this.config.picsum;
    return this.http
      .get<PicsumPhoto[]>(`${baseUrl}/v2/list`, {
        params: { page: page.toString(), limit: limit.toString() },
      })
      .pipe(
        map((rawList) => rawList.map((rawPhoto) => this.mapToPhoto(rawPhoto, false)))
      );
  }

  getPhotoById(photoId: string, useDetailSize = false): Observable<Photo> {
    const { baseUrl } = this.config.picsum;
    return this.http
      .get<PicsumPhoto>(`${baseUrl}/id/${photoId}/info`)
      .pipe(
        map((rawPhoto) => this.mapToPhoto(rawPhoto, useDetailSize))
      );
  }

  /** Converts Picsum API response to app Photo model with correct image dimensions. */
  private mapToPhoto(raw: PicsumPhoto, useDetailSize = false): Photo {
    const { baseUrl, imageWidth, imageHeight, detailImageWidth, detailImageHeight } =
      this.config.picsum;
    const targetWidth = useDetailSize ? detailImageWidth : imageWidth;
    const targetHeight = useDetailSize ? detailImageHeight : imageHeight;
    return {
      id: String(raw.id),
      author: raw.author,
      imageWidth: targetWidth,
      imageHeight: targetHeight,
      imageUrl: `${baseUrl}/id/${raw.id}/${targetWidth}/${targetHeight}`,
    };
  }
}
