import { OverlayRef } from "@angular/cdk/overlay";
import { InjectionToken } from "@angular/core";
import { Observable, PartialObserver, Subject } from "rxjs";
import { filter, take } from "rxjs/operators";
import { DialogComponent } from "./dialog.container";

export const DIALOG_REF = new InjectionToken<DialogRef<any>>('DialogRef');

export class DialogRef<T, R = any> {
  constructor(
    private _overlayRef: OverlayRef,
    private container: DialogComponent,
  ) {
    this.container.onStateChange
      .pipe(
        filter(state => state === 'closed'),
        take(1)
      )
      .subscribe(() => {
        this._overlayRef.detach();
        this._overlayRef.dispose();
        this.onClose.next(this.value);
        this.onClose.complete();
      });
  }

  /**
   * @returns The overlayref that holds the dialog container.
   */
  overlay() { return this._overlayRef }


  /** Value holds the value passed on close() */
  private value: R | null = null;

  /**
   * Emits the result of the dialog and closes the overlay.
   */
  onClose = new Subject<R | null>()

  /** onAction only emits if close() is called with action. */
  onAction<T extends R>(action: T, observer: PartialObserver<T> | ((value: T) => void)): this {
    (this.onClose.pipe(filter(val => val === action)) as Observable<T>)
      .subscribe(observer as any); // typescript does not select the correct type overload here.
    return this;
  }

  close(result?: R) {
    this.value = result || null;
    this.container._startExit();
  }
}
