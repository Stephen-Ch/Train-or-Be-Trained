import { Routes } from '@angular/router';
import { IntroComponent } from './features/components';
import { SetupComponent } from './features/setup.component';
import { ResultComponent } from './features/result.component';
import { resultGuard } from './features/result.guard';

export const routes: Routes = [
  { path: '', component: IntroComponent },
  { path: 'setup', component: SetupComponent },
  { path: 'result', component: ResultComponent, canActivate: [resultGuard] },
  { path: '**', redirectTo: '' }
];
