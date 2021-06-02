import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { of } from 'rxjs';
import { catchError, take, takeUntil, timeout } from 'rxjs/operators';
import { UIStateService } from 'src/app/services';
import { PortapiService } from 'src/app/services/portapi.service';
import { DialogService } from '../dialog';
import { ExitScreenComponent, OVERLAYREF } from './exit-screen';

@Injectable({ providedIn: 'root' })
export class ExitService {
  private hasOverlay = false;

  constructor(
    private stateService: UIStateService,
    private portapi: PortapiService,
    private dialog: DialogService
  ) {
    if (!!window.app) {
      this.portapi.sub('runtime:modules/core/event/shutdown')
        .subscribe(() => {
          setTimeout(() => {
            window.app.exitApp();
          }, 1000)
        })
    }

    window.addEventListener('beforeunload', () => {
      // best effort. may not work all the time depending on
      // the current websocket buffer state
      this.portapi.bridgeAPI('ui/reload', 'POST').subscribe();
    })

    window.addEventListener('message', event => {
      if (event.data === 'on-app-close') {
        this.stateService.uiState()
          // make sure to not wait for the portmaster to start
          .pipe(timeout(1000), catchError(() => of(null)))
          .subscribe(state => {
            if (state?.hideExitScreen) {
              window.app.exitApp();
            }
            if (this.hasOverlay) {
              return;
            }
            this.hasOverlay = true;

            this.dialog.create(ExitScreenComponent, { autoclose: true })
              .onAction('exit', () => window.app.exitApp())
              .onClose.subscribe(() => this.hasOverlay = false);
          })
      }
    })
  }

  shutdownPortmaster() {
    this.dialog.confirm({
      canCancel: true,
      header: 'Shutting Down Portmaster',
      message: 'Shutting down the Portmaster will stop all Portmaster components and will leave your system unprotected!',
      caption: 'Caution',
      buttons: [
        {
          id: 'shutdown',
          danger: true,
          text: 'Shut Down Portmaster'
        }
      ]
    })
      .onAction('shutdown', () => this.portapi.shutdownPortmaster())
  }
}
