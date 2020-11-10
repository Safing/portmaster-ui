import { AfterViewInit, Directive, ElementRef, HostBinding, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: 'span[appCountryFlags]',
})
export class CountryFlagDirective implements AfterViewInit {
  private readonly OFFSET = 127397;

  @HostBinding('style.text-shadow')
  textShadow = 'rgba(255, 255, 255, .5) 0px 0px 1px';

  @Input('appCountryFlags')
  code: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit() {
    const span = this.el.nativeElement as HTMLSpanElement;
    const flag = this.toFlag(this.code);
    this.renderer.setAttribute(span, 'data-before', flag);
    span.innerHTML = `${flag}`;
  }

  private toFlag(code: string) {
    const base = 127462 - 65;
    const cc = code.toUpperCase();
    const res = String.fromCodePoint(...cc.split('').map(c => base + c.charCodeAt(0)));
    return res;
  }
}