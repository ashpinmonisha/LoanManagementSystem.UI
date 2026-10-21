import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RepaymentScheduleResponse } from '../../models/loan-response';
import { Schedule } from '../../services/schedule';
import { ApiCall, defaultLoan } from '../../shared/api-call';
import { ScheduleTable } from '../../shared/schedule-table';
import { StatusMessage } from '../../shared/status-message';
import { LoanForm } from '../loan-form/loan-form';

@Component({
  selector: 'app-repayment-schedule',
  imports: [LoanForm, StatusMessage, ScheduleTable, DecimalPipe],
  template: `
    <app-loan-form title="3.3 Repayment Schedule" buttonText="Generate Schedule" [loan]="loan"
                   [busy]="call.loading()" (submitted)="generate()" />
    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as d) {
      <div class="stats">
        <div class="stat good"><div class="label">Monthly EMI</div><div class="value">{{ d.monthlyEmi | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Total Interest</div><div class="value">{{ d.totalInterest | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Total Repayment</div><div class="value">{{ d.totalRepayment | number: '1.2-2' }}</div></div>
      </div>
      <app-schedule-table [rows]="d.installments" />
    }
  `
})
export class RepaymentSchedule {
  private readonly schedule = inject(Schedule);
  readonly loan = defaultLoan();
  readonly call = new ApiCall<RepaymentScheduleResponse>();

  generate(): void {
    this.call.run(this.schedule.generate(this.loan));
  }
}