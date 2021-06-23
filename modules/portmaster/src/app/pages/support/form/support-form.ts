import { CdkScrollable } from '@angular/cdk/scrolling';
import { HttpClient } from '@angular/common/http';
import { Component, HostBinding, OnDestroy, OnInit, TrackByFunction, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { DebugAPI, StatusService } from 'src/app/services';
import { PortapiService } from 'src/app/services/portapi.service';
import { ActionIndicator, ActionIndicatorService } from 'src/app/shared/action-indicator';
import { fadeInAnimation, fadeInListAnimation, moveInOutAnimation, moveInOutListAnimation } from 'src/app/shared/animations';
import { ConfirmDialogConfig, DialogService } from 'src/app/shared/dialog';
import { SupportPage, SupportType, supportTypes } from '../pages';
import { environment } from 'src/environments/environment';
import { SupportHubService, Issue } from 'src/app/services/supporthub.service';
import { FuzzySearchService } from 'src/app/shared/fuzzySearch';

@Component({
  templateUrl: './support-form.html',
  styleUrls: ['./support-form.scss'],
  animations: [fadeInAnimation, moveInOutAnimation, fadeInListAnimation]
})
export class SupportFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  page: SupportPage | null = null;

  debugData: string = '';
  title: string = '';
  form: { [key: string]: string } = {}
  selectedRepo: string = '';
  haveGhAccount = false;
  version: string = '';
  buildDate: string = '';
  titleMissing = false;

  relatedIssues: Issue[] = [];
  allIssues: Issue[] = [];
  repos: { [repo: string]: string } = {};

  @ViewChild(CdkScrollable)
  scrollContainer: CdkScrollable | null = null;

  trackIssue: TrackByFunction<Issue> = (_: number, issue: Issue) => issue.url;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private uai: ActionIndicatorService,
    private debugapi: DebugAPI,
    private statusService: StatusService,
    private dialog: DialogService,
    private supporthub: SupportHubService,
    private searchService: FuzzySearchService,
  ) { }

  ngOnInit() {
    this.supporthub.loadIssues().subscribe(issues => {
      issues = issues.reverse();
      this.allIssues = issues;
      this.relatedIssues = issues;
    })

    this.statusService.getVersions()
      .subscribe(status => {
        this.version = status.Core.Version;
        this.buildDate = status.Core.BuildDate;
      })

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get("id")
        for (let pIdx = 0; pIdx < supportTypes.length; pIdx++) {
          const pageSection = supportTypes[pIdx];
          const page = pageSection.choices.find(choice => choice.type !== 'link' && choice.id === id);
          if (!!page) {
            this.page = page as SupportPage;
            break;
          }
        }

        if (!this.page) {
          this.router.navigate(['..']);
          return;
        }
        this.title = '';
        this.form = {};
        this.selectedRepo = '';
        this.debugData = '';
        this.repos = {};
        this.page.sections.forEach(section => this.form[section.title] = '');
        this.page.repositories?.forEach(repo => this.repos[repo.repo] = repo.name)

        if (this.page.includeDebugData) {
          this.debugapi.getCoreDebugInfo('github')
            .subscribe({
              next: data => this.debugData = data,
              error: err => this.uai.error('Failed to get Debug Data', this.uai.getErrorMessgae(err))
            })
        }
      })
  }

  searchIssues(text: string) {
    this.relatedIssues = this.searchService.searchList(this.allIssues, text, {
      disableHighlight: true,
      shouldSort: true,
      isCaseSensitive: false,
      minMatchCharLength: 4,
      keys: [
        'title',
        'body',
      ],
    }).map(res => res.item)
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  copyToClipboard(what: string) {
    if (!!navigator.clipboard) {
      navigator.clipboard.writeText(what)
        .then(() => this.uai.success("Copied to Clipboard"))
        .catch(() => this.uai.error('Failed to Copy to Clipboard'));
    } else {
      this.uai.info('Failed to Copy to Clipboard', 'Copy to clipboard is not supported by your browser')
    }
  }

  validate(): boolean {
    this.titleMissing = this.title === '';
    const valid = !this.titleMissing;
    if (!valid) {
      this.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return valid;
  }

  createOnGithub(genUrl?: boolean) {
    if (!this.validate()) {
      return;
    }

    if (genUrl === undefined && this.haveGhAccount) {
      genUrl = true;
    }

    if (genUrl === undefined) {
      this.dialog.confirm({
        canCancel: true,
        caption: 'Caution',
        header: 'Create Without Github Account',
        message: 'We will create the Github issue for you but without knowing your Github account we will not be able to contact you for further information. How would you like to continue?',
        buttons: [
          { id: 'createWithout', text: 'Create Without Account', class: 'outline' },
          { id: 'openGithub', text: 'Use My Account' },
        ]
      })
        .onAction('openGithub', () => {
          this.createOnGithub(true);
        })
        .onAction('createWithout', () => {
          this.createOnGithub(false);
        })
      return;
    }

    let debugInfo: Observable<string> = this.supporthub.uploadText('debug-info', this.debugData);
    if (!this.page?.includeDebugData) {
      debugInfo = of('');
    }

    debugInfo
      .pipe(
        mergeMap(url => this.supporthub.createIssue(
          this.selectedRepo,
          this.page?.ghIssuePreset || '',
          this.title,
          this.page!.sections.map(section => ({
            title: section.title,
            body: this.form[section.title],
          })),
          url,
          { generateUrl: genUrl || false }
        ))
      )
      .subscribe({
        next: url => {
          const openUrl = () => {
            if (!!window.app) {
              window.app.openExternal(url);
            } else {
              window.open(url, '__blank');
            }
          }

          if (genUrl === true) {
            openUrl();
            return;
          }

          const opts: ConfirmDialogConfig = {
            canCancel: false,
            buttons: [{ id: '', text: 'Close', class: 'outline' }, { id: 'open', text: 'Open Issue' }],
            caption: 'Info',
            header: 'Issue Created!',
            message: 'We successfully created the issue on Github for you. Use the following link to check for updates: ' + url,
          }
          this.dialog.confirm(opts)
            .onAction('open', () => {
              openUrl();
            })
        },
        error: err => {
          this.uai.error('Failed to create issue', this.uai.getErrorMessgae(err))
        }
      })
  }

  openIssue(issue: Issue) {
    if (!!window.app) {
      window.app.openExternal(issue.url);
      return;
    }
    window.open(issue.url, '__blank')
  }

  createPrivateTicket() {
    if (!this.validate()) {
      return;
    }

    const opts: ConfirmDialogConfig = {
      caption: 'Caution',
      canCancel: true,
      header: 'How should we contact you?',
      message: 'Please enter your E-Mail address below so we can contact you for further information and keep you updated on your issue.',
      inputModel: '',
      inputPlaceholder: 'E-Mail Address',
      inputType: 'text',
      buttons: [
        { id: '', class: 'outline', text: 'Cancel' },
        { id: 'create', text: 'Create Ticket' },
      ],
    }
    this.dialog.confirm(opts)
      .onAction('create', () => {
        let debugInfo: Observable<string> = this.supporthub.uploadText('debug-info', this.debugData);
        if (!this.page?.includeDebugData) {
          debugInfo = of('');
        }

        debugInfo
          .pipe(
            mergeMap(url => this.supporthub.createTicket(
              this.selectedRepo,
              this.title,
              opts.inputModel || '',
              this.page!.sections.map(section => ({
                title: section.title,
                body: this.form[section.title],
              })),
              url,
            ))
          )
          .subscribe({
            next: () => {
              let msg = '';
              if (!!opts.inputModel) {
                msg = 'You will be contacted as soon as possible';
              }
              this.uai.success('Ticket created successfully', msg)
            },
            error: err => {
              this.uai.error('Failed to create ticket', this.uai.getErrorMessgae(err))
            }
          })
      });
  }

}
