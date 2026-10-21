import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EmiResponse } from '../../models/loan-response';
import { Emi } from '../../services/emi';
import { ApiCall, defaultLoan } from '../../shared/api-call';
import { StatusMessage } from '../../shared/status-message';
import { LoanForm } from '../loan-form/loan-form';

@Component({
  selector: 'app-emi-calculator',
  imports: [LoanForm, StatusMessage, DecimalPipe],
  template: `
    <app-loan-form title="3.1 EMI Calculation" [loan]="loan"
                   [busy]="call.loading()" (submitted)="calculate()" />
    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as d) {
      <div class="stats">
        <div class="stat"><div class="label">Loan Amount</div><div class="value">{{ d.loanAmount | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Interest Rate</div><div class="value">{{ d.interestRate }} %</div></div>
        <div class="stat"><div class="label">Loan Tenure</div><div class="value">{{ d.loanTenureMonths }} months</div></div>
        <div class="stat good"><div class="label">Monthly EMI</div><div class="value">{{ d.monthlyEmi | number: '1.2-2' }}</div></div>
      </div>
    }
  `
})
export class EmiCalculator {
  private readonly emi = inject(Emi);
  readonly loan = defaultLoan();
  readonly call = new ApiCall<EmiResponse>();

  calculate(): void {
    this.call.run(this.emi.calculate(this.loan));
  }
}