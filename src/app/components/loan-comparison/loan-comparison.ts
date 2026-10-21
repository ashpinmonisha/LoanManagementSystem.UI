import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompareOption } from '../../models/loan-request';
import { LoanComparisonResponse } from '../../models/loan-response';
import { Comparison } from '../../services/comparison';
import { ApiCall } from '../../shared/api-call';
import { StatusMessage } from '../../shared/status-message';

@Component({
  selector: 'app-loan-comparison',
  imports: [StatusMessage, FormsModule, DecimalPipe],
  template: `
    <section class="card">
      <h2>3.4 Loan Comparison</h2>

      @for (o of options; track $index) {
        <div class="option-row">
          <div class="tag">Option {{ $index + 1 }}</div>
          <label>Loan Amount <input type="number" [name]="'amount' + $index" [(ngModel)]="o.loanAmount" /></label>
          <label>Rate (%) <input type="number" step="0.01" [name]="'rate' + $index" [(ngModel)]="o.interestRate" /></label>
          <label>Tenure (months) <input type="number" [name]="'tenure' + $index" [(ngModel)]="o.loanTenureMonths" /></label>
          <button class="remove-btn" title="Remove" (click)="remove($index)">✕</button>
        </div>
      }

      <div class="actions">
        <button class="btn secondary" (click)="add()">+ Add option</button>
        <button class="btn" [disabled]="call.loading()" (click)="compare()">Compare</button>
      </div>
    </section>

    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as d) {
      <div class="stats">
        <div class="stat good"><div class="label">Lowest Interest Rate</div><div class="value">{{ d.lowestInterestRateOption }}</div></div>
        <div class="stat good"><div class="label">Shortest Tenure</div><div class="value">{{ d.shortestTenureOption }}</div></div>
        <div class="stat good"><div class="label">Lowest EMI</div><div class="value">{{ d.lowestEmiOption }}</div></div>
        <div class="stat good"><div class="label">Lowest Total Interest</div><div class="value">{{ d.lowestTotalInterestOption }}</div></div>
      </div>

      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Option</th><th>Loan Amount</th><th>Rate</th><th>Tenure</th>
              <th>Monthly EMI</th><th>Total Interest</th><th>Total Repayment</th>
            </tr>
          </thead>
          <tbody>
            @for (o of d.options; track o.label) {
              <tr>
                <td>{{ o.label }}</td>
                <td>{{ o.loanAmount | number: '1.2-2' }}</td>
                <td>{{ o.interestRate }} %</td>
                <td>{{ o.loanTenureMonths }}</td>
                <td>{{ o.monthlyEmi | number: '1.2-2' }}</td>
                <td>{{ o.totalInterest | number: '1.2-2' }}</td>
                <td>{{ o.totalRepayment | number: '1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class LoanComparison {
  private readonly comparison = inject(Comparison);
  readonly call = new ApiCall<LoanComparisonResponse>();

  options: CompareOption[] = [
    { loanAmount: 500000, interestRate: 10.5, loanTenureMonths: 24 },
    { loanAmount: 500000, interestRate: 9.5, loanTenureMonths: 36 }
  ];

  add(): void {
    if (this.options.length < 5) {
      this.options.push({ loanAmount: 500000, interestRate: 10.5, loanTenureMonths: 24 });
    }
  }

  remove(index: number): void {
    this.options.splice(index, 1);
  }

  compare(): void {
    this.call.run(this.comparison.compare(this.options));
  }
}