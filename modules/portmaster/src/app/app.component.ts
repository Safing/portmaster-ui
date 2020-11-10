import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { PortapiService } from './services/portapi.service';
import { fadeInAnimation, fadeOutAnimation } from './shared/animations';
import { debounce, debounceTime, map, startWith, take } from 'rxjs/operators';
import { Action, FailureStatus, getOnlineStatusString, ModuleStatus, NotificationsService, NotificationType, OnlineStatus, StatusService, Subsystem } from './services';
import { ActionHandler, VirtualNotification } from './services/virtual-notification';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Record } from './services/portapi.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    fadeInAnimation,
    fadeOutAnimation,
  ]
})
export class AppComponent implements OnInit {
  readonly connected = this.portapi.connected$.pipe(
    debounceTime(250),
    startWith(false)
  );
  title = 'portmaster';

  showDebugPanel = false;

  private onlineStatusNotification: VirtualNotification<any> | null = null;
  private subsystemWarnings = new Map<string, VirtualNotification<Subsystem>>();

  constructor(
    public ngZone: NgZone,
    public portapi: PortapiService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private statusService: StatusService,
    private notificationService: NotificationsService,
  ) {
    (window as any).fakeNotification = () => {
      this.notificationService.create(
        `random-id-${Math.random()}`,
        'A **fake** message for testing notifications.<br> :rocket:',
        NotificationType.Info,
        {
          Title: 'Fake Message',
          Category: 'Testing',
          AvailableActions: [
            {
              ID: 'a1',
              Text: 'Got it',
            },
            {
              ID: 'a2',
              Text: 'Go away'
            }
          ]
        }
      ).subscribe();
    }

    (window as any).portapi = portapi;
    (window as any).toggleDebug = () => {
      // this may be called from outside of angulars execution zone.
      // make sure to call toggle and call inside angular.
      this.ngZone.runGuarded(() => {
        this.showDebugPanel = !this.showDebugPanel;
        this.changeDetectorRef.detectChanges();
      })
    }
  }

  ngOnInit() {
    // TODO(ppacher): move virtual notification handling to a dedicated service

    this.statusService.status$.subscribe(status => {
      if (status.OnlineStatus === OnlineStatus.Online) {
        this.onlineStatusNotification?.dispose()
        this.onlineStatusNotification = null;
      } else {
        let title = '';
        let msg = '';
        let actions: ActionHandler<any>[] = [];

        this.onlineStatusNotification?.dispose();

        switch (status.OnlineStatus) {
          case OnlineStatus.Limited:
          case OnlineStatus.SemiOnline:
            title = 'Limited Network Access';
            msg = 'Portmaster detected limited network access.'
            break;

          case OnlineStatus.Offline:
            title = 'No Network Access'
            msg = 'Portmaster failed to connect to the internet.'
            break;

          case OnlineStatus.Portal:
            title = 'Captive Portal Detected'
            msg = `Portmaster detected a captive portal in your network.`
            actions = [
              {
                ID: 'open-portal',
                Text: 'Open',
                Run: (n: VirtualNotification<any>) => {
                  if ('openExternal' in (window as any)) {
                    (window as any).openExternal(status.CaptivePortal.URL);
                  }
                }
              }
            ]
            break;
        }

        if (title != '') {
          this.onlineStatusNotification = new VirtualNotification(
            'ui:online-status',
            NotificationType.Info,
            title,
            msg,
            {
              Category: 'Online-Status',
              AvailableActions: actions,
            },
          );

          this.notificationService.inject(this.onlineStatusNotification, { autoRemove: false });
        }
      }
    });

    this.statusService.watchSubsystems()
      .pipe(debounceTime(100))
      .subscribe(subsystems => {
        subsystems.forEach(subsystem => {
          subsystem.Modules.forEach(module => {
            const key = `ui:subsystem-${subsystem.ID}-${module.Name}`;

            if (module.FailureStatus === FailureStatus.Operational) {
              const notif = this.subsystemWarnings.get(key);
              if (!!notif) {
                this.subsystemWarnings.delete(key);
                notif.dispose();
              }
            } else {
              let actions: ActionHandler<any>[] = [];

              switch (module.FailureID) {
                case "missing-resolver":
                  actions.push({
                    ID: 'ui:redirect-resolver',
                    Text: 'Open',
                    Run: () => {
                      this.router.navigate(['/', 'settings'], { queryParams: { setting: 'dns/nameservers' } });
                    }
                  })
                  break;
                case "update-failed":
                  actions.push({
                    ID: 'ui:force-update',
                    Text: 'Retry',
                    Run: () => {
                      this.downloadUpdates();
                    }
                  })
                  break;
                case "no-access-code":
                case "invalid-access-code":
                  actions.push({
                    ID: 'ui:redirect-resolver',
                    Text: 'Open',
                    Run: () => {
                      this.router.navigate(['/', 'settings'], { queryParams: { setting: 'spn/specialAccessCode' } });
                    }
                  })
                  break;
              }

              const notif = new VirtualNotification<any>(
                key,
                module.FailureStatus === FailureStatus.Hint ? NotificationType.Info : NotificationType.Warning,
                subsystem.Name,
                module.FailureMsg,
                {
                  Category: module.Name,
                }
              );

              this.notificationService.inject(notif);
            }
          });
        });
      });
  }

  injectTrigger(module: string, kind: string): Observable<void> {
    return this.portapi.get<Record>(`control:module/${module}/trigger/${kind}`)
      .pipe(map(() => { }))
  }

  downloadUpdates() {
    this.injectTrigger('updates', 'trigger update').subscribe()
  }
}