import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CalculationHistory as HistoryItem } from '../../models/loan-response';
import { History } from '../../services/history';
import { ApiCall } from '../../shared/api-call';
import { StatusMessage } from '../../shared/status-message';

@Component({
  selector: 'app-calculation-history',
  imports: [StatusMessage, DecimalPipe, DatePipe],
  template: `
    <section class="card">
      <h2>Calculation History</h2>
      <button class="btn" [disabled]="call.loading()" (click)="load()">Refresh</button>
    </section>
    <app-status-message [loading]="call.loading()" [error]="call.error()" />

    @if (call.result(); as list) {
      @if (list.length === 0) {
        <div class="card">No calculations saved yet.</div>
      } @else {
        <div class="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th><th>Loan Amount</th><th>Rate</th><th>Tenure</th>
                <th>Monthly EMI</th><th>Total Interest</th><th>Total Repayment</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (h of list; track h.id) {
                <tr>
                  <td>{{ h.calculationType }}</td>
                  <td>{{ h.loanAmount | number: '1.2-2' }}</td>
                  <td>{{ h.interestRate }} %</td>
                  <td>{{ h.loanTenureMonths }}</td>
                  <td>{{ h.monthlyEmi | number: '1.2-2' }}</td>
                  <td>{{ h.totalInterest | number: '1.2-2' }}</td>
                  <td>{{ h.totalRepayment | number: '1.2-2' }}</td>
                  <td>{{ h.calculatedAtUtc | date: 'dd MMM yyyy, HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }
  `
})
export class CalculationHistory implements OnInit {
  private readonly history = inject(History);
  readonly call = new ApiCall<HistoryItem[]>();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.call.run(this.history.getAll());
  }
}