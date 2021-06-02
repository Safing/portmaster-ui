import { AnimationEvent } from '@angular/animations';
import { OverlayRef } from '@angular/cdk/overlay';
import { Component, HostBinding, HostListener, Inject, InjectionToken, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UIStateService } from 'src/app/services';
import { fadeInAnimation, fadeOutAnimation } from '../animations';
import { DialogRef, DIALOG_REF } from '../dialog';

export const OVERLAYREF = new InjectionToken<OverlayRef>('OverlayRef');

@Component({
  templateUrl: './exit-screen.html',
  styleUrls: ['./exit-screen.scss'],
  animations: [
    fadeInAnimation,
    fadeOutAnimation,
  ]
})
export class ExitScreenComponent {
  constructor(
    @Inject(DIALOG_REF) private _dialogRef: DialogRef<any>,
    private stateService: UIStateService,
  ) { }

  /** @private - used as ngModel form the template */
  neveragain: boolean = false;

  closeUI() {
    const closeObserver = {
      next: () => {
        this._dialogRef.close('exit');
      }
    }

    let close: Observable<any> = of(null);
    if (this.neveragain) {
      close = this.stateService.uiState()
        .pipe(
          map(state => {
            state.hideExitScreen = true;
            return state;
          }),
          switchMap(state => this.stateService.saveState(state)),
        )
    }
    close.subscribe(closeObserver)
  }

  cancel() {
    this._dialogRef.close()
  }
}
