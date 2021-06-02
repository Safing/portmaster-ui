import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { MarkdownModule } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DebugComponent } from './debug/debug-panel';
import { NotificationFactoryComponent } from './debug/notification-factory/notification-factory';
import { PortapiInspectorComponent } from './debug/portapi-inspector/portapi-inspector';
import { NavigationComponent } from './layout/navigation/navigation';
import { SideDashComponent } from './layout/side-dash/side-dash';
import { MonitorApplicationViewComponent, MonitorPageComponent, NetworkOverviewComponent } from './pages/monitor';
import { SettingsComponent } from './pages/settings/settings';
import { WidgetSettingsOutletComponent } from './pages/widget-settings-outlet/widget-settings-outlet';
import { AccordionComponent, AccordionGroupComponent } from './shared/accordion';
import { BasicSettingComponent } from './shared/config/basic-setting/basic-setting';
import { RuleListComponent } from './shared/config/rule-list/rule-list';
import { RuleListItemComponent } from './shared/config/rule-list/list-item';
import { GenericSettingComponent } from './shared/config/generic-setting/generic-setting';
import { SecuritySettingComponent } from './shared/config/security-setting/security-setting';
import { FilterListComponent } from './shared/config/filter-lists';
import { CountIndicatorComponent } from './shared/count-indicator/count-indicator';
import { CountryFlagDirective } from './shared/country-flag/country-flag';
import { DropdownComponent } from './shared/dropdown/dropdown';
import { DropDownItemComponent, DropDownValueDirective } from './shared/dropdown/item';
import { ExpertiseDirective } from './shared/expertise/expertise-directive';
import { ExpertiseComponent } from './shared/expertise/expertise-switch';
import { FuzzySearchPipe } from './shared/fuzzySearch';
import { NotificationComponent } from './shared/notification/notification';
import { SafePipe } from './shared/save.pipe';
import { PlaceholderComponent } from './shared/text-placeholder';
import { ToggleSwitchComponent } from './shared/toggle-switch/toggle-switch';
import { MarkdownWidgetComponent, MarkdownWidgetSettingsComponent } from './widgets/markdown-widget';
import { NotificationWidgetComponent, NotificationWidgetSettingsComponent } from './widgets/notification-widget';
import { PilotWidgetComponent } from './widgets/pilot-widget';
import { StatusWidgetComponent, StatusWidgetSettingsComponent } from './widgets/status-widget';
import { WIDGET_DEFINTIONS } from './widgets/widget.types';
import { AppSettingsPageComponent, AppOverviewComponent } from './pages/app-settings';
import { ProfileStatisticsComponent } from './shared/profile-stats';
import { ConfigSettingsViewComponent } from './shared/config/config-settings';
import { AppIconComponent } from './shared/app-icon';
import { MenuComponent, MenuTriggerComponent, MenuItemComponent, MenuGroupComponent } from './shared/menu';
import { OrderedListComponent, OrderedListItemComponent } from './shared/config/ordererd-list';
import { MultiSwitchComponent, SwitchItemComponent } from './shared/multi-switch';
import { AutoFocusDirective } from './shared/focus';
import { PromptWidgetComponent } from './widgets/prompt-widget';
import { LoadingComponent } from './shared/loading';
import { ExternalLinkDirective } from './shared/external-link.directive';
import { ScopeLabelComponent } from './shared/scope-label';
import { TimeAgoPipe } from './shared/time-ago.pipe';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ConnectionsViewComponent, ScopeGroupContentComponent, UngroupedConnectionContentComponent, UngroupedConnectionRowComponent, ConnectionExpertisePipe, ConnectionLocationPipe, CanUseRulesPipe, IsBlockedConnectionPipe } from './shared/connections-view';
import { IndicatorComponent } from './shared/action-indicator';
import { ExitScreenComponent } from './shared/exit-screen/exit-screen';
import { ConfirmDailogComponent, DialogComponent } from './shared/dialog';

@NgModule({
  declarations: [
    AppComponent,
    NotificationComponent,
    DebugComponent,
    AccordionComponent,
    AccordionGroupComponent,
    NotificationFactoryComponent,
    PortapiInspectorComponent,
    BasicSettingComponent,
    GenericSettingComponent,
    SecuritySettingComponent,
    SettingsComponent,
    MonitorPageComponent,
    SideDashComponent,
    NavigationComponent,
    ExpertiseComponent,
    ExpertiseDirective,
    DropdownComponent,
    ConnectionsViewComponent,
    DropDownItemComponent,
    DropDownValueDirective,
    WidgetSettingsOutletComponent,
    StatusWidgetComponent,
    StatusWidgetSettingsComponent,
    ToggleSwitchComponent,
    RuleListComponent,
    RuleListItemComponent,
    PilotWidgetComponent,
    StatusWidgetComponent,
    StatusWidgetSettingsComponent,
    MarkdownWidgetSettingsComponent,
    ProfileStatisticsComponent,
    MarkdownWidgetComponent,
    NotificationWidgetSettingsComponent,
    NotificationWidgetComponent,
    FuzzySearchPipe,
    SafePipe,
    TimeAgoPipe,
    MonitorApplicationViewComponent,
    CountIndicatorComponent,
    AppSettingsPageComponent,
    CountryFlagDirective,
    AppOverviewComponent,
    PlaceholderComponent,
    ConfigSettingsViewComponent,
    FilterListComponent,
    AppIconComponent,
    NetworkOverviewComponent,
    MenuComponent,
    MenuTriggerComponent,
    MenuItemComponent,
    MenuGroupComponent,
    OrderedListComponent,
    OrderedListItemComponent,
    MultiSwitchComponent,
    SwitchItemComponent,
    AutoFocusDirective,
    PromptWidgetComponent,
    LoadingComponent,
    ExternalLinkDirective,
    ScopeLabelComponent,
    ScopeGroupContentComponent,
    UngroupedConnectionContentComponent,
    UngroupedConnectionRowComponent,
    ConnectionExpertisePipe,
    ConnectionLocationPipe,
    CanUseRulesPipe,
    IsBlockedConnectionPipe,
    IndicatorComponent,
    ExitScreenComponent,
    DialogComponent,
    ConfirmDailogComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    FontAwesomeModule,
    OverlayModule,
    PortalModule,
    CdkTableModule,
    DragDropModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    ScrollingModule,
  ],
  providers: [
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'status-widget',
        name: 'Demo',
        settingsComponent: StatusWidgetSettingsComponent,
        widgetComponent: StatusWidgetComponent,
      },
      multi: true,
    },
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'markdown-widget',
        name: 'Markdown',
        settingsComponent: MarkdownWidgetSettingsComponent,
        widgetComponent: MarkdownWidgetComponent,
      },
      multi: true,
    },
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'pilot-widget',
        name: 'Pilot',
        widgetComponent: PilotWidgetComponent,
        disableCustom: true,
      },
      multi: true,
    },
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'notification-widget',
        name: 'Notifications',
        widgetComponent: NotificationWidgetComponent,
        //settingsComponent: NotificationWidgetSettingsComponent,
      },
      multi: true,
    },
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'prompt-widget',
        name: 'Prompts',
        widgetComponent: PromptWidgetComponent,
      },
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
