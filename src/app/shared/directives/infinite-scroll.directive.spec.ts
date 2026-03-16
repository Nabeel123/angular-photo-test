import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { InfiniteScrollDirective } from './infinite-scroll.directive';

@Component({
  template: `<div appInfiniteScroll (scrolledToEnd)="onEnd()"></div>`,
  imports: [InfiniteScrollDirective],
})
class HostComponent {
  onEnd = vi.fn();
}

describe('InfiniteScrollDirective', () => {
  let observerCallback: IntersectionObserverCallback;
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (this: object, cb: IntersectionObserverCallback) {
        observerCallback = cb;
        return { observe: observeSpy, disconnect: disconnectSpy };
      })
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  function setup(platformId = 'browser'): ComponentFixture<HostComponent> {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.createComponent(HostComponent);
  }

  it('should create an IntersectionObserver and observe the element', () => {
    const fixture = setup();
    fixture.detectChanges();
    expect(IntersectionObserver).toHaveBeenCalled();
    expect(observeSpy).toHaveBeenCalled();
  });

  it('should emit scrolledToEnd when sentinel intersects', () => {
    const fixture = setup();
    fixture.detectChanges();
    observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(fixture.componentInstance.onEnd).toHaveBeenCalledOnce();
  });

  it('should NOT emit when not intersecting', () => {
    const fixture = setup();
    fixture.detectChanges();
    observerCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(fixture.componentInstance.onEnd).not.toHaveBeenCalled();
  });

  it('should disconnect observer on destroy', () => {
    const fixture = setup();
    fixture.detectChanges();
    fixture.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should NOT create observer on server platform', () => {
    const fixture = setup('server');
    fixture.detectChanges();
    expect(IntersectionObserver).not.toHaveBeenCalled();
  });
});
