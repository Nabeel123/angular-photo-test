import {
  afterNextRender,
  Directive,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScrollDirective {
  readonly threshold = input<number>(0.1);

  readonly scrolledToEnd = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            this.scrolledToEnd.emit();
          }
        },
        { threshold: this.threshold() }
      );

      observer.observe(this.el.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
