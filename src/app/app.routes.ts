import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login/login';

import { LoanApplicationComponent } from './features/loan-application/loan-application/loan-application';
import { LoanApprovalComponent } from './features/loan-approval/loan-approval';
import { RiskAssessmentComponent } from './features/risk-assessment/risk-assessment';
import { DashboardComponent } from './features/dashboard/Dashboard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'loan-application',
    component: LoanApplicationComponent,
    canActivate: [authGuard]
  },
  {
    path: 'loan-approval/:id',
    component: LoanApprovalComponent,
    canActivate: [authGuard]
  },
  {
    path: 'risk-assessment/:id',
    component: RiskAssessmentComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];