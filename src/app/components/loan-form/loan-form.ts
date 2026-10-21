import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoanRequest } from '../../models/loan-request';

@Component({
  selector: 'app-loan-form',
  imports: [FormsModule],
  template: `
    <section class="card">
      <h2>{{ title() }}</h2>

      <div class="grid">
        <label>Loan Amount
          <input type="number" name="loanAmount"
                 [ngModel]="loan().loanAmount" (ngModelChange)="loan().loanAmount = $event" />
        </label>
        <label>Interest Rate (% per year)
          <input type="number" step="0.01" name="interestRate"
                 [ngModel]="loan().interestRate" (ngModelChange)="loan().interestRate = $event" />
        </label>
        <label>Loan Tenure (months)
          <input type="number" name="loanTenureMonths"
                 [ngModel]="loan().loanTenureMonths" (ngModelChange)="loan().loanTenureMonths = $event" />
        </label>
        <label>First EMI Date
          <input type="date" name="startDate"
                 [ngModel]="loan().startDate" (ngModelChange)="loan().startDate = $event" />
        </label>
      </div>

      <ng-content />

      <button class="btn" [disabled]="busy()" (click)="submitted.emit()">{{ buttonText() }}</button>
    </section>
  `
})
export class LoanForm {
  readonly loan = input.required<LoanRequest>();
  readonly title = input('Loan Details');
  readonly buttonText = input('Calculate');
  readonly busy = input(false);
  readonly submitted = output<void>();
}