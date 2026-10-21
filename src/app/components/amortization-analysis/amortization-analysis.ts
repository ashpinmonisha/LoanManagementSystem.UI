import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AmortizationResponse } from '../../models/loan-response';
import { Amortization } from '../../services/amortization';
import { ApiCall, defaultLoan } from '../../shared/api-call';
import { StatusMessage } from '../../shared/status-message';
import { LoanForm } from '../loan-form/loan-form';

@Component({
  selector: 'app-amortization-analysis',
  imports: [LoanForm, StatusMessage, DecimalPipe, DatePipe],
  template: `
    <app-loan-form title="3.4 Amortization Analysis" buttonText="Analyze" [loan]="loan"
                   [busy]="call.loading()" (submitted)="analyze()" />
    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as d) {
      <div class="stats">
        <div class="stat"><div class="label">Total Principal</div><div class="value">{{ d.principalVsInterest.totalPrincipal | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Total Interest</div><div class="value">{{ d.principalVsInterest.totalInterest | number: '1.2-2' }}</div></div>
        <div class="stat good"><div class="label">Total Repayment</div><div class="value">{{ d.totalRepayment | number: '1.2-2' }}</div></div>
        <div class="stat"><div class="label">Interest-to-Principal Ratio</div><div class="value">{{ d.interestToPrincipalRatio }}</div></div>
      </div>

      <div class="card">
        <h2>Principal vs Interest</h2>
        <div class="split-bar">
          <div class="p" [style.width.%]="d.principalVsInterest.principalPercentage"></div>
          <div class="i" [style.width.%]="d.principalVsInterest.interestPercentage"></div>
        </div>
        <div class="legend">
          <span><span class="dot dot-p"></span>Principal {{ d.principalVsInterest.principalPercentage }}%</span>
          <span><span class="dot dot-i"></span>Interest {{ d.principalVsInterest.interestPercentage }}%</span>
        </div>
      </div>

      <h3>Monthly Balance</h3>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Installment No.</th><th>Due Date</th><th>Balance</th></tr></thead>
          <tbody>
            @for (m of d.monthlyBalances; track m.installmentNumber) {
              <tr>
                <td>{{ m.installmentNumber }}</td>
                <td>{{ m.dueDate | date: 'dd MMM yyyy' }}</td>
                <td>{{ m.balance | number: '1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class AmortizationAnalysis {
  private readonly amortization = inject(Amortization);
  readonly loan = defaultLoan();
  readonly call = new ApiCall<AmortizationResponse>();

  analyze(): void {
    this.call.run(this.amortization.analyze(this.loan));
  }
}