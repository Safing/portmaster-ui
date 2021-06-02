import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ComponentRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { filter, take, takeUntil } from 'rxjs/operators';
import { ConfirmDailogComponent, ConfirmDialogConfig, CONFIRM_DIALOG_CONFIG } from './confirm.dialog';
import { DialogComponent } from './dialog.container';
import { DialogRef, DIALOG_REF } from './dialog.ref';

export interface BaseDialogConfig {
  autoclose?: boolean;
  backdrop?: boolean;
  dragable?: boolean;
}

export interface ComponentPortalConfig {
  injector?: Injector;
}

@Injectable({ providedIn: 'root' })
export class DialogService {

  constructor(
    private injector: Injector,
    private overlay: Overlay,
  ) { }

  create<T>(template: TemplatePortal<T>, opts?: BaseDialogConfig): DialogRef<EmbeddedViewRef<T>>;
  create<T>(target: ComponentType<T>, opts?: BaseDialogConfig & ComponentPortalConfig): DialogRef<ComponentRef<T>>;
  create<T>(target: ComponentType<T> | TemplatePortal<T>, opts: BaseDialogConfig & ComponentPortalConfig = {}): DialogRef<any> {
    const cfg = new OverlayConfig({
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy: this.overlay
        .position()
        .global()
        .centerVertically()
        .centerHorizontally(),
      hasBackdrop: opts.backdrop === undefined ? true : opts.backdrop,
      backdropClass: 'dialog-screen-backdrop'
    });
    const overlayref = this.overlay.create(cfg);

    // create our dialog container and attach it to the
    // overlay.
    const containerPortal = new ComponentPortal(
      DialogComponent,
      undefined,
      this.injector,
    )
    const containerRef = containerPortal.attach(overlayref);

    if (!!opts.dragable) {
      containerRef.instance.dragable = true;
    }

    // create the dialog ref
    const dialogRef = new DialogRef<T>(overlayref, containerRef.instance);

    // prepare the content portal and attach it to the container
    let result: any;
    if (target instanceof TemplatePortal) {
      result = containerRef.instance.attachTemplatePortal(target)
    } else {
      const contentPortal = new ComponentPortal(target, null, Injector.create({
        providers: [
          {
            provide: DIALOG_REF,
            useValue: dialogRef,
          }
        ],
        parent: opts?.injector || this.injector,
      }));
      result = containerRef.instance.attachComponentPortal(contentPortal);
    }
    // update the container position now that we have some content.
    overlayref.updatePosition();

    if (!!opts?.autoclose) {
      overlayref.outsidePointerEvents()
        .pipe(take(1))
        .subscribe(() => dialogRef.close());
      overlayref.keydownEvents()
        .pipe(
          takeUntil(overlayref.detachments()),
          filter(event => event.key === 'Escape')
        )
        .subscribe(() => {
          dialogRef.close();
        })
    }
    return dialogRef;
  }

  confirm(opts: ConfirmDialogConfig): DialogRef<ConfirmDailogComponent, string> {
    return this.create(ConfirmDailogComponent, {
      autoclose: opts.canCancel,
      injector: Injector.create({
        providers: [
          {
            provide: CONFIRM_DIALOG_CONFIG,
            useValue: opts,
          },
        ],
        parent: this.injector,
      })
    })
  }
}
