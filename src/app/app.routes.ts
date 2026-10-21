import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login/login';
import { EMI_ROUTES } from './emi.routes';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  ...EMI_ROUTES,
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];