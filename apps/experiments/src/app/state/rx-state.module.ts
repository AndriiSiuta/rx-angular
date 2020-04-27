import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TemplateModule } from '@rx-angular/template';
import { RouterModule } from '@angular/router';
import { ROUTES as RX_STATE_ROUTES } from './rx-state.routes';

import { RxStateOverviewComponent } from './rx-state.overview.component';
import { RxStateParentCompositionComponent } from './composition/parent.component';
import { RxStateParentSubscriptionComponent } from './subscription/parent.component';
import { RxStateParentSelectionsComponent } from './selections/parent.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxStateChildSelectionsComponent } from './selections/child.component';
import { RxStateParentSubscriptionLessComponent } from './subscription-less-interaction/parent.component';
import { RxStateParentGetImperativeComponent } from './get-imperative/parent.component';
import { RxStateParentGetImperativeSolutionComponent } from './get-imperative/solution.component';
import { RxStateChildGetImperativeComponent } from './get-imperative/child.component';
import { RxStateChildConnectReactiveComponent } from './connect-reactive/child.component';
import { RxStateParentUpdateReactiveComponent } from './connect-reactive/parent.component';
import { RxStateParentUpdateReactiveSolutionComponent } from './connect-reactive/solution.component';
import { RxStateParentSelectReactiveComponent } from './select-reactive/parent.component';
import { RxStateParentSelectReactiveSolutionComponent } from './select-reactive/solution.component';
import { RxStateChildSelectReactiveComponent } from './select-reactive/child.component';
import { RxStateParentUpdateImperativeComponent } from './set-imperative/parent.component';
import { RxStateParentUpdateImperativeSolutionComponent } from './set-imperative/solution.component';
import { RxStateChildSetImperativeComponent } from './set-imperative/child.component';

@NgModule({
  declarations: [
    RxStateOverviewComponent,
    RxStateChildSelectionsComponent,
    RxStateParentCompositionComponent,
    RxStateParentSelectionsComponent,
    RxStateParentSubscriptionComponent,
    RxStateParentSubscriptionLessComponent,
    RxStateParentUpdateImperativeComponent,
    RxStateParentUpdateImperativeSolutionComponent,
    RxStateChildSetImperativeComponent,
    RxStateParentUpdateReactiveComponent,
    RxStateChildConnectReactiveComponent,
    RxStateParentUpdateReactiveSolutionComponent,
    RxStateParentSelectReactiveComponent,
    RxStateChildSelectReactiveComponent,
    RxStateParentSelectReactiveSolutionComponent,
    RxStateParentGetImperativeComponent,
    RxStateParentGetImperativeSolutionComponent,
    RxStateChildGetImperativeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(RX_STATE_ROUTES),
    MatListModule,
    MatTableModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TemplateModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RxStateModule {}