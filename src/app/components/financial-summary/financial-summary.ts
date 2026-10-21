import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FinancialSummaryResponse } from '../../models/loan-response';
import { Summary } from '../../services/summary';
import { ApiCall, defaultLoan } from '../../shared/api-call';
import { StatusMessage } from '../../shared/status-message';
import { LoanForm } from '../loan-form/loan-form';

@Component({
  selector: 'app-financial-summary',
  imports: [LoanForm, StatusMessage, DecimalPipe],
  template: `
    <app-loan-form title="3.4 Financial Summary" buttonText="Get Summary" [loan]="loan"
                   [busy]="call.loading()" (submitted)="load()" />
    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as d) {
      <div class="stats">
        <div class="stat"><div class="label">Total Principal</div><div class="value">{{ d.totalPrincipal | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Total Interest</div><div class="value">{{ d.totalInterest | number: '1.2-2' }}</div></div>
        <div class="stat good"><div class="label">Total Repayment</div><div class="value">{{ d.totalRepayment | number: '1.2-2' }}</div></div>
      </div>

      <h3>EMI Summary</h3>
      <div class="stats">
        <div class="stat"><div class="label">Monthly EMI</div><div class="value">{{ d.emiSummary.monthlyEmi | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Loan Tenure</div><div class="value">{{ d.emiSummary.loanTenureMonths }} months</div></div>
        <div class="stat"><div class="label">Installments</div><div class="value">{{ d.emiSummary.numberOfInstallments }}</div></div>
        <div class="stat"><div class="label">Avg Monthly Interest</div><div class="value">{{ d.emiSummary.averageMonthlyInterest | number: '1.2-2' }}</div></div>
      </div>

      <h3>Loan Cost Analysis</h3>
      <div class="stats">
        <div class="stat"><div class="label">Interest-to-Principal Ratio</div><div class="value">{{ d.loanCostAnalysis.interestToPrincipalRatio }}</div></div>
        <div class="stat"><div class="label">Total Cost</div><div class="value">{{ d.loanCostAnalysis.totalCostPercentage }} % of loan</div></div>
        <div class="stat"><div class="label">Interest per 100 Borrowed</div><div class="value">{{ d.loanCostAnalysis.interestPerHundredBorrowed | number: '1.2-2' }}</div></div>
      </div>
    }
  `
})
export class FinancialSummary {
  private readonly summary = inject(Summary);
  readonly loan = defaultLoan();
  readonly call = new ApiCall<FinancialSummaryResponse>();

  load(): void {
    this.call.run(this.summary.get(this.loan));
  }
}