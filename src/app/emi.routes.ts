import { Routes } from '@angular/router';
import { AmortizationAnalysis } from './components/amortization-analysis/amortization-analysis';
import { CalculationHistory } from './components/calculation-history/calculation-history';
import { EmiCalculator } from './components/emi-calculator/emi-calculator';
import { EmiLayout } from './components/emi-layout/emi-layout';
import { FinancialSummary } from './components/financial-summary/financial-summary';
import { InterestCalculator } from './components/interest-calculator/interest-calculator';
import { LoanComparison } from './components/loan-comparison/loan-comparison';
import { PrepaymentCalculator } from './components/prepayment-calculator/prepayment-calculator';
import { RepaymentSchedule } from './components/repayment-schedule/repayment-schedule';

export const EMI_ROUTES: Routes = [
  {
    path: 'emi',
    component: EmiLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'calculate' },
      { path: 'calculate', component: EmiCalculator },
      { path: 'interest', component: InterestCalculator },
      { path: 'schedule', component: RepaymentSchedule },
      { path: 'amortization', component: AmortizationAnalysis },
      { path: 'prepayment', component: PrepaymentCalculator },
      { path: 'comparison', component: LoanComparison },
      { path: 'summary', component: FinancialSummary },
      { path: 'history', component: CalculationHistory }
    ]
  }
];