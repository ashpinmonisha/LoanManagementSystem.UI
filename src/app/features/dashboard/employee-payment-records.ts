import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './Dashboard';

@Component({
  selector: 'app-employee-payment-records',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="records-workspace" aria-labelledby="records-title">
      <header class="records-heading">
        <div>
          <span class="eyebrow">EMPLOYEE PAYMENT PORTAL</span>
          <h2 id="records-title">Payment records</h2>
          <p>Monitor incoming repayments, outstanding balances, and recent transactions.</p>
        </div>
        <span class="live-badge"><span aria-hidden="true"></span> Connected records</span>
      </header>

      @if (dashboard.loading || dashboard.paymentsLoading) {
        <p class="loading-state" role="status">Loading customer payments...</p>
      } @else if (dashboard.errorMessage) {
        <p class="notice error" role="alert">Payments unavailable. Refresh to try again.</p>
      } @else {
        <div class="record-metrics" aria-label="Payment totals">
          <article class="metric-card collected">
            <span class="metric-icon" aria-hidden="true">₹</span>
            <span>Successful payments</span>
            <strong>{{ dashboard.totalPaid | currency: 'INR' }}</strong>
            <small>{{ successfulPaymentCount }} completed transactions</small>
          </article>
          <article class="metric-card pending">
            <span class="metric-icon" aria-hidden="true">↗</span>
            <span>Outstanding balance</span>
            <strong>{{ dashboard.totalPending | currency: 'INR' }}</strong>
            <small>Across active loans</small>
          </article>
          <article class="metric-card overdue">
            <span class="metric-icon" aria-hidden="true">!</span>
            <span>Overdue amount</span>
            <strong>{{ overdueAmount | currency: 'INR' }}</strong>
            <small>Review loans with overdue EMIs</small>
          </article>
        </div>

        @if (dashboard.paymentDataIncomplete) {
          <p class="notice warning" role="alert">
            Some payment details could not be loaded. Records and totals may be incomplete.
          </p>
        }

        <section class="records-panel" aria-label="Customer payment transaction list">
          <div class="table-heading">
            <div>
              <h3>Recent transactions</h3>
              <p>Search by customer, loan, or payment reference.</p>
            </div>
            <span class="record-count">{{ records.length }} shown</span>
          </div>
          <label class="search-field">
            <span class="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search customer, loan or reference"
              [value]="search"
              (input)="search = $any($event.target).value"
              placeholder="Search payment records..."
            />
          </label>

          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Customer</th>
                  <th>Loan</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (payment of records; track $index) {
                  <tr>
                    <td class="payment-id">#{{ payment.paymentId }}</td>
                    <td>{{ payment.customerId }}</td>
                    <td>#{{ payment.loanId }}</td>
                    <td class="amount">{{ payment.amount | currency: 'INR' }}</td>
                    <td>{{ payment.paymentDate ? (payment.paymentDate | date: 'medium') : 'Unavailable' }}</td>
                    <td>{{ payment.paymentMethod || 'Unavailable' }}</td>
                    <td class="reference">{{ payment.paymentReference || 'Unavailable' }}</td>
                    <td>
                      <span
                        class="status"
                        [class.success]="['success', 'successful', 'completed', 'paid'].includes((payment.paymentStatus ?? '').toLowerCase())"
                        [class.pending]="(payment.paymentStatus ?? '').toLowerCase() === 'pending'"
                        [class.failed]="['failed', 'rejected'].includes((payment.paymentStatus ?? '').toLowerCase())"
                      >
                        {{ payment.paymentStatus || 'Unknown' }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-state">
                      {{ search ? 'No matching payment records.' : 'No customer payments recorded.' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </section>
  `,
  styles: [`
    :host { display: block; color: #18283e; }
    .records-workspace { display: grid; gap: 20px; }
    .records-heading, .table-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .records-heading { margin-bottom: 2px; }
    .eyebrow { color: #087f8c; font-size: 9px; font-weight: 800; letter-spacing: 1.4px; }
    h2 { margin: 6px 0; color: #172d4c; font-size: 22px; letter-spacing: -.5px; }
    h3 { margin: 0 0 5px; color: #1d334f; font-size: 15px; }
    p { margin: 0; color: #697b90; font-size: 11px; line-height: 1.6; }
    .live-badge, .record-count { display: inline-flex; align-items: center; gap: 7px; flex: 0 0 auto; padding: 8px 11px; border: 1px solid #ccebdd; border-radius: 999px; color: #087568; background: #f0fbf6; font-size: 10px; font-weight: 750; }
    .live-badge > span { width: 7px; height: 7px; border-radius: 50%; background: #11a17e; box-shadow: 0 0 0 3px #11a17e20; }
    .record-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .metric-card { display: grid; justify-items: start; gap: 8px; min-width: 0; padding: 17px; border: 1px solid #e1eaf2; border-radius: 11px; background: #f8fbff; }
    .metric-icon { display: grid; place-items: center; width: 29px; height: 29px; border-radius: 9px; color: #087f8c; background: #e4f5fb; font-size: 14px; font-weight: 800; }
    .metric-card > span:not(.metric-icon) { color: #687b91; font-size: 10px; }
    .metric-card strong { color: #19314f; font-size: clamp(18px, 2.2vw, 23px); letter-spacing: -.5px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
    .metric-card small { color: #7d8ca0; font-size: 9px; line-height: 1.5; }
    .metric-card.collected { border-color: #d3eee2; background: #f4fcf8; }
    .metric-card.collected .metric-icon { color: #087568; background: #ddf5eb; }
    .metric-card.collected strong { color: #087568; }
    .metric-card.overdue { border-color: #f2dfd4; background: #fff9f5; }
    .metric-card.overdue .metric-icon { color: #b35832; background: #fff0e7; }
    .metric-card.overdue strong { color: #a64b28; }
    .notice { padding: 11px 13px; border-radius: 8px; font-size: 11px; line-height: 1.5; }
    .notice.error { color: #a52a43; background: #fff2f4; }
    .notice.warning { border: 1px solid #f0dfb8; color: #84621b; background: #fffaf0; }
    .records-panel { min-width: 0; padding: 19px; border: 1px solid #e2eaf2; border-radius: 11px; background: #fff; }
    .table-heading { margin-bottom: 13px; }
    .record-count { border-color: #dce7f1; color: #61758d; background: #f7f9fc; white-space: nowrap; }
    .search-field { display: flex; align-items: center; gap: 9px; width: min(390px, 100%); min-height: 38px; margin-bottom: 13px; padding: 0 11px; border: 1px solid #dce5ee; border-radius: 8px; color: #76899f; background: #fff; }
    .search-icon { font-size: 19px; line-height: 1; }
    input { width: 100%; min-width: 0; border: 0; outline: 0; color: #253952; background: transparent; font: inherit; font-size: 11px; }
    input::placeholder { color: #8a98a9; }
    .search-field:focus-within { border-color: #168caa; box-shadow: 0 0 0 3px #168caa1a; }
    .table-scroll { overflow-x: auto; border: 1px solid #e6edf4; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    thead { background: #f4f8fc; }
    th, td { padding: 11px 12px; border-bottom: 1px solid #eaf0f5; font-size: 10px; }
    th { color: #687b91; font-size: 9px; font-weight: 750; letter-spacing: .35px; text-transform: uppercase; white-space: nowrap; }
    td { color: #43566e; white-space: nowrap; }
    tbody tr:last-child td { border-bottom: 0; }
    .payment-id { color: #087f8c; font-weight: 750; }
    .amount { color: #243d5b; font-weight: 750; font-variant-numeric: tabular-nums; }
    .reference { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
    .status { display: inline-flex; padding: 5px 8px; border-radius: 999px; color: #687b91; background: #edf2f7; font-size: 9px; font-weight: 750; text-transform: capitalize; }
    .status.success { color: #087568; background: #e5f7ee; }
    .status.pending { color: #8b650e; background: #fff5d9; }
    .status.failed { color: #ac344b; background: #fff0f3; }
    .empty-state { padding: 24px; color: #708197; text-align: center; }
    .loading-state { padding: 18px; }
    @media (max-width: 850px) { .record-metrics { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .records-heading, .table-heading { align-items: flex-start; flex-direction: column; } .records-panel { padding: 14px; } }
  `],
})
export class EmployeePaymentRecords {
  readonly dashboard = inject(DashboardComponent);
  search = '';

  get successfulPaymentCount(): number {
    return this.dashboard.paymentHistory.filter(payment =>
      ['success', 'successful', 'completed', 'paid'].includes(
        (payment.paymentStatus ?? '').trim().toLowerCase(),
      ),
    ).length;
  }

  get overdueAmount(): number {
    return Object.values(this.dashboard.paymentSummary).reduce(
      (total, item) => total + (item.balance?.overdueAmount ?? 0),
      0,
    );
  }

  get records() {
    const query = this.search.trim().toLowerCase();
    return this.dashboard.paymentHistory
      .filter(payment => [payment.customerId, payment.loanId, payment.paymentReference, payment.paymentStatus]
        .some(value => String(value ?? '').toLowerCase().includes(query)))
      .slice()
      .sort((a, b) => (Date.parse(b.paymentDate) || 0) - (Date.parse(a.paymentDate) || 0));
  }
}
