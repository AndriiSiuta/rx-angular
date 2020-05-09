import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'rx-if',
    pathMatch: 'full'
  },
  {
    path: 'rx-if',
    loadChildren: () =>
      import('./examples/demo-basics/demo-basics.module').then(
        m => m.DemoBasicsModule
      )
  },
  {
    path: 'mutate-state',
    loadChildren: () =>
      import('./examples/mutate-state/mutate-state.module').then(
        m => m.MutateStateModule
      )
  },
  {
    path: 'dynamic-counter',
    loadChildren: () =>
      import('./examples/dynamic-counter/dynamic-counter.module').then(
        m => m.DynamicCounterModule
      )
  }
];
