import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { InterestResponse } from '../../models/loan-response';
import { Interest } from '../../services/interest';
import { ApiCall, defaultLoan } from '../../shared/api-call';
import { StatusMessage } from '../../shared/status-message';
import { LoanForm } from '../loan-form/loan-form';

@Component({
  selector: 'app-interest-calculator',
  imports: [LoanForm, StatusMessage, DecimalPipe],
  template: `
    <app-loan-form title="3.2 Interest Calculation" [loan]="loan"
                   [busy]="call.loading()" (submitted)="calculate()" />
    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as d) {
      <div class="stats">
        <div class="stat"><div class="label">Principal Amount</div><div class="value">{{ d.principalAmount | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Monthly Interest (1st month)</div><div class="value">{{ d.monthlyInterest | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Total Interest</div><div class="value">{{ d.totalInterest | number: '1.2-2' }}</div></div>
        <div class="stat good"><div class="label">Total Repayment</div><div class="value">{{ d.totalRepayment | number: '1.2-2' }}</div></div>
      </div>
    }
  `
})
export class InterestCalculator {
  private readonly interest = inject(Interest);
  readonly loan = defaultLoan();
  readonly call = new ApiCall<InterestResponse>();

  calculate(): void {
    this.call.run(this.interest.calculate(this.loan));
  }
}