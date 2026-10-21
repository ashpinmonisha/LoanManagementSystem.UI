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
  // 4.1 Record Payment
  {
    path: 'payments/record',
    loadComponent: () =>
      import('./features/payment-management/payment-form/payment-form')
      .then(m => m.PaymentForm)
  },

// 4.2 Payment History
  {
    path: 'payments/history',
    loadComponent: () =>
    import('./features/payment-management/payment-history/payment-history')
      .then(m => m.PaymentHistory)
  },

// 4.3 Outstanding Balance
  {
    path: 'payments/outstanding',
    loadComponent: () =>
    import('./features/payment-management/outstanding/outstanding')
      .then(m => m.Outstanding)
  },

// 4.4 Advanced Payment
  {
    path: 'payments/advanced',
    loadComponent: () =>
    import('./features/payment-management/advanced-payment/advanced-payment')
      .then(m => m.AdvancedPayment)
  },
  {
    path: 'payments/make',
    loadComponent: () =>
    import('./features/payment-management/make-payment/make-payment')
      .then(m => m.MakePayment)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
