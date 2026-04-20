import { Routes } from '@angular/router';
import { IntroComponent } from './features/components';
import { LensComponent } from './features/lens.component';
import { SelectComponent } from './features/select.component';
import { QuestionV2Component } from './features/question-v2.component';
import { ResultComponent } from './features/result.component';

export const routes: Routes = [
  { path: '', component: IntroComponent },
  { path: 'lens', component: LensComponent },
  { path: 'select', component: SelectComponent },
  { path: 'q/:id', component: QuestionV2Component },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: '' }
];
