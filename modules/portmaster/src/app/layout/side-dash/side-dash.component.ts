import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-side-dash',
  templateUrl: './side-dash.component.html',
  styleUrls: ['./side-dash.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideDashComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}