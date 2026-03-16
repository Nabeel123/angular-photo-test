import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PhotoCardComponent } from './photo-card.component';
import { Photo } from '@app/core';
import { createMockPhoto } from '@app/core/testing/photo-test-data';

const mockPhoto = createMockPhoto({ author: 'Test Author' });

describe('PhotoCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  function setup(isFavorite = false) {
    const fixture = TestBed.createComponent(PhotoCardComponent);
    fixture.componentRef.setInput('photo', mockPhoto);
    fixture.componentRef.setInput('isFavorite', isFavorite);
    fixture.detectChanges();
    return fixture;
  }

  it('should render the author name', () => {
    const fixture = setup();
    expect(fixture.nativeElement.textContent).toContain('Test Author');
  });

  it('should show favorite_border icon when not favorite', () => {
    const fixture = setup(false);
    const favBtn = fixture.nativeElement.querySelector('.photo-card__fav-btn');
    const icon = favBtn?.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('favorite_border');
  });

  it('should show favorite icon when is favorite', () => {
    const fixture = setup(true);
    const favBtn = fixture.nativeElement.querySelector('.photo-card__fav-btn');
    const icon = favBtn?.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('favorite');
  });

  it('should emit cardClicked when card is clicked', () => {
    const fixture = setup();
    const emitted: Photo[] = [];
    fixture.componentInstance.cardClicked.subscribe((photo: Photo) => emitted.push(photo));
    const card = fixture.nativeElement.querySelector('.photo-card');
    card?.click();
    expect(emitted).toEqual([mockPhoto]);
  });

  it('should emit favoriteToggled when heart button is clicked', () => {
    const fixture = setup();
    const emitted: Photo[] = [];
    fixture.componentInstance.favoriteToggled.subscribe((photo: Photo) => emitted.push(photo));
    const favBtn = fixture.nativeElement.querySelector('.photo-card__fav-btn');
    favBtn?.click();
    expect(emitted).toEqual([mockPhoto]);
  });

  it('should have accessible aria-label on card', () => {
    const fixture = setup();
    const card = fixture.nativeElement.querySelector('.photo-card');
    expect(card?.getAttribute('aria-label')).toContain('Test Author');
  });
});
