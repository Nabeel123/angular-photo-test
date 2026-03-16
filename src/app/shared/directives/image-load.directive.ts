import {
  AfterViewInit,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Place on an img element. Emits when the image has loaded (load event or already complete).
 * Handles cached images: when resetTrigger changes, re-checks if the new src is already loaded.
 */
@Directive({
  selector: 'img[appImageLoad]',
  host: { '(load)': 'onLoad()' },
})
export class ImageLoadDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLImageElement>);

  /** When this changes (e.g. photo id), re-check if the image is already complete (cached) */
  readonly resetTrigger = input<string | number | undefined>();

  readonly loaded = output<void>();

  private readonly _ = effect(() => {
    this.resetTrigger();
    queueMicrotask(() => this.checkAndEmit());
  });

  ngAfterViewInit(): void {
    queueMicrotask(() => this.checkAndEmit());
  }

  private checkAndEmit(): void {
    const img = this.el.nativeElement;
    if (img?.complete && img.naturalWidth > 0) {
      this.loaded.emit();
    }
  }

  onLoad(): void {
    this.loaded.emit();
  }
}
