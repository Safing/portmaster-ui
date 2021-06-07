import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';
import { DialogRef, DIALOG_REF } from './dialog.ref';

export interface ConfirmDialogButton {
  text: string;
  id: string;
  class?: 'danger' | 'outline';
}

export interface ConfirmDialogConfig {
  buttons?: ConfirmDialogButton[];
  canCancel?: boolean;
  header?: string;
  message?: string;
  caption?: string;
}

export const CONFIRM_DIALOG_CONFIG = new InjectionToken<ConfirmDialogConfig>('ConfirmDialogConfig');

@Component({
  templateUrl: './confirm.dialog.html',
  styleUrls: ['./confirm.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDailogComponent {
  constructor(
    @Inject(DIALOG_REF) private dialogRef: DialogRef<any>,
    @Inject(CONFIRM_DIALOG_CONFIG) public config: ConfirmDialogConfig,
  ) { }

  select(action?: string) {
    this.dialogRef.close(action || null);
  }
}
