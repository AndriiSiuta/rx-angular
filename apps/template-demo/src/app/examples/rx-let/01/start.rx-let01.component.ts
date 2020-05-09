import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';

@Component({
  selector: 'solution-rx-if-1',
  template: `
    <button (click)="isVisibleSubject.next()">Toggle</button>
    i$: {{ isVisible$ | push }}
    <ng-container *ngIf="isVisible$ | async as i">
      {{ i }}
    </ng-container>
    <ng-container *rxLet="isVisible$; let i">
      {{ i }}
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartRxLet01Component {
  isVisibleSubject = new Subject<boolean>();
  isVisible$ = this.isVisibleSubject.pipe(scan(b => !b));
}