import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrepaymentResponse } from '../../models/loan-response';
import { Prepayment } from '../../services/prepayment';
import { ApiCall, defaultLoan } from '../../shared/api-call';
import { ScheduleTable } from '../../shared/schedule-table';
import { StatusMessage } from '../../shared/status-message';
import { LoanForm } from '../loan-form/loan-form';

@Component({
  selector: 'app-prepayment-calculator',
  imports: [LoanForm, StatusMessage, ScheduleTable, FormsModule, DecimalPipe],
  template: `
    <app-loan-form title="3.4 Prepayment Calculation" [loan]="loan"
                   [busy]="call.loading()" (submitted)="calculate()">
      <div class="grid">
        <label>Installments Already Paid
          <input type="number" name="installmentsPaid" [(ngModel)]="installmentsPaid" />
        </label>
        <label>Prepayment Amount
          <input type="number" name="prepaymentAmount" [(ngModel)]="prepaymentAmount" />
        </label>
      </div>
    </app-loan-form>
    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as d) {
      <div class="stats">
        <div class="stat"><div class="label">Prepayment Amount</div><div class="value">{{ d.prepaymentAmount | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Outstanding Before</div><div class="value">{{ d.outstandingBeforePrepayment | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">New Outstanding</div><div class="value">{{ d.newOutstanding | number: '1.2-2' }}</div></div>
        <div class="stat good"><div class="label">Interest Saved</div><div class="value">{{ d.interestSaved | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Original Tenure</div><div class="value">{{ d.originalTenureMonths }} months</div></div>
        <div class="stat good"><div class="label">Revised Tenure</div><div class="value">{{ d.revisedTenureMonths }} months</div></div>
        <div class="stat good"><div class="label">Months Saved</div><div class="value">{{ d.monthsSaved }}</div></div>
        <div class="stat"><div class="label">Revised Total Interest</div><div class="value">{{ d.revisedTotalInterest | number: '1.2-2' }}</div></div>
      </div>

      <h3>Revised Schedule</h3>
      <app-schedule-table [rows]="d.revisedSchedule" />
    }
  `
})
export class PrepaymentCalculator {
  private readonly prepayment = inject(Prepayment);
  readonly loan = defaultLoan();
  readonly call = new ApiCall<PrepaymentResponse>();

  installmentsPaid = 6;
  prepaymentAmount = 100000;

  calculate(): void {
    this.call.run(
      this.prepayment.calculate({
        ...this.loan,
        installmentsPaid: this.installmentsPaid,
        prepaymentAmount: this.prepaymentAmount
      })
    );
  }
}