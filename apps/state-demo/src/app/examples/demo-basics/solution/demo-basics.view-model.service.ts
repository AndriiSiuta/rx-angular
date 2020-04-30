import { Injectable } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { interval, merge, Observable, Subject, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export interface DemoBasicsItem {
  id: string;
  name: string;
}

export interface DemoBasicsBaseModel {
  refreshInterval: number;
  list: DemoBasicsItem[];
  listExpanded: boolean;
  isPending: boolean;
}

export interface DemoBasicsView {
  refreshClicks: Subject<Event>;
  listExpandedChanges: Subject<boolean>;
  baseModel$: Observable<DemoBasicsBaseModel>;
}

const initState: DemoBasicsBaseModel = {
  refreshInterval: 9000,
  listExpanded: true,
  isPending: true,
  list: []
};

@Injectable()
export class DemoBasicsViewModelService extends RxState<DemoBasicsBaseModel>
  implements DemoBasicsView {
  baseModel$ = this.select();

  refreshClicks = new Subject<Event>();
  listExpandedChanges = new Subject<boolean>();

  refreshListSideEffect$ = merge(
    this.refreshClicks,
    this.select(map(s => s.refreshInterval)).pipe(
      tap(v => console.log('vvv', v)),
      switchMap(ms => interval(ms))
    )
  );

  constructor() {
    super();
    this.set(initState);

    this.connect(
      this.listExpandedChanges.pipe(map(b => ({ listExpanded: b })))
    );
  }
}
