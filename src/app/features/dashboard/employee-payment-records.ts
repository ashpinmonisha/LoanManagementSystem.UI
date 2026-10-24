import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './Dashboard';

@Component({
  selector: 'app-employee-payment-records',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Customer payment records</h2>
    <p>See who paid, the amount, and the payment status. Use Refresh data to load the latest records.</p>
    @if (dashboard.loading || dashboard.paymentsLoading) {
      <p role="status">Loading customer payments...</p>
    } @else if (dashboard.errorMessage) {
      <p role="alert">Payments unavailable. Refresh to try again.</p>
    } @else {
      <p><strong>Successful payments received: {{ dashboard.totalPaid | currency: 'INR' }}</strong></p>
      @if (dashboard.paymentDataIncomplete) {
        <p role="alert">Some payment details could not be loaded. Records and totals are incomplete.</p>
      }
      <label>Search customer, loan or reference
        <input type="search" [value]="search" (input)="search = $any($event.target).value" placeholder="Search payment records..." />
      </label>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Payment ID</th><th>Customer ID</th><th>Loan ID</th><th>Amount</th><th>Date</th><th>Method</th><th>Reference</th><th>Status</th></tr></thead>
          <tbody>
            @for (payment of records; track $index) {
              <tr>
                <td>#{{ payment.paymentId }}</td><td>{{ payment.customerId }}</td><td>#{{ payment.loanId }}</td>
                <td>{{ payment.amount | currency: 'INR' }}</td>
                <td>{{ payment.paymentDate ? (payment.paymentDate | date: 'medium') : 'Unavailable' }}</td>
                <td>{{ payment.paymentMethod || 'Unavailable' }}</td><td>{{ payment.paymentReference || 'Unavailable' }}</td>
                <td>{{ payment.paymentStatus || 'Unknown' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="8">{{ search ? 'No matching payment records.' : 'No customer payments recorded.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    :host { display: block; color: #18283e; }
    p { color: #596b80; line-height: 1.6; }
    label { display: grid; gap: 8px; margin: 20px 0; }
    input { padding: 12px; border: 1px solid #d5dee8; border-radius: 8px; max-width: 480px; font: inherit; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f7f9fc; white-space: nowrap; }
  `],
})
export class EmployeePaymentRecords {
  readonly dashboard = inject(DashboardComponent);
  search = '';

  get records() {
    const query = this.search.trim().toLowerCase();
    return this.dashboard.paymentHistory
      .filter(payment => [payment.customerId, payment.loanId, payment.paymentReference, payment.paymentStatus]
        .some(value => String(value ?? '').toLowerCase().includes(query)))
      .slice()
      .sort((a, b) => (Date.parse(b.paymentDate) || 0) - (Date.parse(a.paymentDate) || 0));
  }
}
