import { AnimationEvent } from '@angular/animations';
import { CdkPortalOutlet, ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Component, ComponentRef, EmbeddedViewRef, HostBinding, HostListener, InjectionToken, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { dialogAnimation } from './dialog.animations';

export const DIALOG_PORTAL = new InjectionToken<Portal<any>>('DialogPortal');

export type DialogState = 'opening' | 'open' | 'closing' | 'closed';

@Component({
  template: `
  <div class="container" cdkDrag cdkDragRootElement=".cdk-overlay-pane" [cdkDragDisabled]="!dragable">
    <div *ngIf="dragable" cdkDragHandle id="drag-handle"></div>
    <ng-container cdkPortalOutlet></ng-container>
  </div>
  `,
  styleUrls: ['./dialog.scss'],
  animations: [dialogAnimation]
})
export class DialogComponent {
  onStateChange = new Subject<DialogState>();

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  @HostBinding('@dialogContainer')
  state = 'enter';

  @ViewChild(CdkPortalOutlet, { static: true })
  _portalOutlet: CdkPortalOutlet | null = null;

  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    return this._portalOutlet!.attachComponentPortal(portal)
  }

  attachTemplatePortal<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T> {
    return this._portalOutlet!.attachTemplatePortal(portal);
  }

  @Input()
  dragable: boolean = false;

  @HostListener('@dialogContainer.start', ['$event'])
  onAnimationStart({ fromState, toState }: AnimationEvent) {
    if (toState === 'enter') {
      this.onStateChange.next('opening');
    } else if (toState === 'exit') {
      this.onStateChange.next('closing');
    }
  }

  @HostListener('@dialogContainer.done', ['$event'])
  onAnimationEnd({ fromState, toState }: AnimationEvent) {
    if (toState === 'enter') {
      this.onStateChange.next('open');
    } else if (toState === 'exit') {
      this.onStateChange.next('closed');
    }
  }

  /** Starts the exit animation */
  _startExit() {
    this.state = 'exit';
    this.cdr.markForCheck();
  }
}
