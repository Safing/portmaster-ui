import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { delayWhen, distinctUntilChanged, filter, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppProfile, ConfigService, FlatConfigObject, flattenProfileConfig, isDefaultValue, setAppSetting, Setting } from 'src/app/services';
import { AppProfileService } from 'src/app/services/app-profile.service';
import { ConnTracker, InspectedProfile } from 'src/app/services/connection-tracker.service';
import { ActionIndicatorService } from 'src/app/shared/action-indicator';
import { fadeInAnimation, fadeOutAnimation } from 'src/app/shared/animations';
import { SaveSettingEvent } from 'src/app/shared/config/generic-setting/generic-setting';
import { DialogService } from 'src/app/shared/dialog';

@Component({
  templateUrl: './app-settings.html',
  styleUrls: ['../page.scss', './app-settings.scss'],
  animations: [
    fadeOutAnimation,
    fadeInAnimation,
  ]
})
export class AppSettingsPageComponent implements OnInit, OnDestroy {
  /** subscription to our update-process observable */
  private subscription = Subscription.EMPTY;

  /**
   * @private
   * The current AppProfile we are showing.
   */
  appProfile: AppProfile | null = null;

  /**
   * @private
   * Whether or not the overview componet should be rendered.
   */
  get showOverview() { return this.appProfile == null }

  /**
   * @private
   * The currently displayed list of settings
   */
  settings: Setting[] = [];

  /**
   * @private
   * The current search term displayed in the search-input.
   */
  searchTerm = '';

  /**
   * @private
   * The key of the setting to highligh, if any ...
   */
  highlightSettingKey: string | null = null;

  /**
   * @private
   * Emits whenever the currently used settings "view" changes.
   */
  viewSettingChange = new BehaviorSubject<'all' | 'active'>('active');

  /**
   * @private
   *
   * Defines what "view" we are currently in
   */
  get viewSetting(): 'all' | 'active' {
    return this.viewSettingChange.getValue();
  };

  /**
   * @private
   * True if the currently selected app profile is running and has
   * network connections.
   */
  get isActive() {
    return this.connTrack.inspected !== null;
  }

  /**
   * @private
   * The inspected application profile, if any.
   */
  get inspected(): InspectedProfile | null {
    return this.connTrack.inspected;
  }

  constructor(
    private profileService: AppProfileService,
    private route: ActivatedRoute,
    private connTrack: ConnTracker,
    private configService: ConfigService,
    private router: Router,
    private actionIndicator: ActionIndicatorService,
    private dialog: DialogService,
  ) { }

  /**
   * @private
   * Used to save a change in the app settings. Emitted by the config-view
   * component
   *
   * @param event The emitted save-settings-event.
   */
  saveSetting(event: SaveSettingEvent) {
    // Guard against invalid usage and abort if there's not appProfile
    // to save.
    if (!this.appProfile) {
      return;
    }

    // If the value has been "reset to global value" we need to
    // set the value to "undefined".
    if (event.isDefault) {
      setAppSetting(this.appProfile!.Config, event.key, undefined);
    } else {
      setAppSetting(this.appProfile!.Config, event.key, event.value);
    }

    // Actually safe the profile
    this.profileService.saveProfile(this.appProfile!)
      .subscribe({
        error: err => {
          // if there's a callback function for errors call it.
          if (!!event.rejected) {
            event.rejected(err);
          }

          console.error(err);
          this.actionIndicator.error('Failed to save setting', err);
        },
      })
  }

  ngOnInit() {
    // watch the route parameters and start watching the referenced
    // application profile.
    const profileStream: Observable<AppProfile | null>
      = this.route.paramMap
        .pipe(
          delayWhen(() => this.connTrack.ready),
          switchMap(params => {
            // Get the profile source and id. If one is unset (null)
            // than return a"null" emit-once stream.
            const source = params.get("source");
            const id = params.get("id")
            if (source === null || id === null) {
              return of(null);
            }

            // Start watching the application profile.
            // switchMap will unsubscribe automatically if
            // we start watching a different profile.
            return this.profileService.watchAppProfile(source, id);
          })
        );


    this.subscription =
      combineLatest([
        profileStream,                        // emits the current app profile everytime it changes
        this.route.queryParamMap,             // for changes to the settings= query parameter
        this.profileService.globalConfig(),   // for changes to ghe global profile
        this.configService.query(""),         // get ALL settings (once, only the defintion is of intereset)
        this.viewSettingChange.pipe(          // watch the current "settings-view" setting, but only if it changes
          distinctUntilChanged(),
        ),
      ])
        .subscribe(([profile, queryMap, global, allSettings, viewSetting]) => {
          this.appProfile = profile;
          this.highlightSettingKey = queryMap.get('setting');
          let profileConfig: FlatConfigObject = {};

          // if we have a profile flatten it's configuration map to something
          // more useful.
          if (!!profile) {
            profileConfig = flattenProfileConfig(profile!.Config);
          }

          // if we should highlight a setting make sure to switch the
          // viewSetting to all if it's the "global" default (that is, no
          // value is set). Otherwise the setting won't render and we cannot
          // highlight it.
          if (!!this.highlightSettingKey) {
            if (profileConfig[this.highlightSettingKey] === undefined) {
              this.viewSettingChange.next('all');
            }
          }

          if (!!profile) {
            // Tell the connection track to start watching the current profile.
            this.connTrack.inspect(profile.ID);

            // filter the settings and remove all settings that are not
            // profile specific (i.e. not part of the global config). Also
            // update the current settings value (from the app profile) and
            // the default value (from the global profile).
            this.settings = allSettings
              .map(setting => {
                setting.Value = profileConfig[setting.Key];
                setting.DefaultValue = global[setting.Key];
                return setting;
              })
              .filter(setting => {
                if (!(setting.Key in global)) {
                  return false;
                }

                if (this.viewSetting === 'all') {
                  return true;
                }
                return setting.Value !== undefined;
              });

          } else {
            // there's no profile to view so tell the connection-tracker
            // to stop watching the previous one.
            this.connTrack.clearInspection();
          }
        });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.connTrack.clearInspection();
  }

  /**
   * @private
   * Delete the current profile. Requires a two-step confirmation.
   */
  deleteProfile() {
    if (!this.appProfile) {
      return;
    }

    this.dialog.confirm({
      canCancel: true,
      caption: 'Caution',
      header: 'Deleting Profile ' + this.appProfile.Name,
      message: 'Do you really want to delete this profile? All settings will be lost.',
      buttons: [
        { id: '', text: 'Cancel', class: 'outline' },
        { id: 'delete', class: 'danger', text: 'Yes, delete it' },
      ]
    })
      .onAction('delete', () => {
        this.profileService.deleteProfile(this.appProfile!)
          .subscribe(() => {
            this.router.navigate(['/app/overview'])
            this.actionIndicator.success('Profile Deleted', 'Successfully deleted profile '
              + this.appProfile?.Name);
          })
      })
  }
}
