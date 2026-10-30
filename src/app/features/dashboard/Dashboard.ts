import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, Subscription, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoanApplication } from '../../core/models/loan.model';
import { LoginService } from '../login/login/login.service';
import { LoanApplicationService } from '../loan-application/loan-application/loan-application.service';
import { OutstandingBalance, PaymentHistory, PaymentService } from '../../core/services/payment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrls: [
    './Dashboard.css',
    './dashboard-panels.css',
    './dashboard-responsive.css',
    './dashboard-employee.css',
    './dashboard-growth.css',
    './dashboard-workspace.css',
    './dashboard-workspace-panels.css',
    './employee-dashboard-overview.css',
  ],
})
export class DashboardComponent implements OnInit {
  private readonly navigation = toSignal(inject(Router).events.pipe(filter(event => event instanceof NavigationEnd)));
  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);

  get selectedPage(): string {
    this.navigation();
    if (this.router.url.split(/[?#]/)[0].startsWith('/dashboard/payments')) return 'payments';
    const fragment = this.fragment();
    if (fragment?.startsWith('loan-')) return 'applications';
    return ['growth', 'applications', 'payment-summary', 'notifications'].includes(fragment ?? '')
      ? fragment!
      : 'overview';
  }

  get pageTitle(): string {
    switch (this.selectedPage) {
      case 'payments': return 'Payments';
      case 'growth': return 'Growth overview';
      case 'applications': return 'Review applications';
      case 'payment-summary': return 'Payment summary';
      case 'notifications': return 'Notifications';
      default: return 'Welcome, ' + (this.employee?.employeeName || 'Employee') + '!';
    }
  }

  private readonly loans = inject(LoanApplicationService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly payments = inject(PaymentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private paymentSubscription?: Subscription;
  private applicationSubscription?: Subscription;

  paymentSummary: Record<number, { paid: number | null; balance: OutstandingBalance | null }> = {};
  paymentsLoading = false;
  paymentHistory: PaymentHistory[] = [];
  growthMonths = 6;

  get approvedLoanAmount(): number {
    return this.applications
      .filter((loan) =>
        ['approved', 'disbursed', 'active', 'closed', 'completed'].includes(
          loan.status.trim().toLowerCase(),
        ),
      )
      .reduce((sum, loan) => sum + loan.loanAmount, 0);
  }

  get netMovement(): number {
    return this.totalPaid - this.approvedLoanAmount;
  }

  get collectionRatio(): number | null {
    return this.approvedLoanAmount > 0 ? (this.totalPaid / this.approvedLoanAmount) * 100 : null;
  }

  get growthData(): { label: string; incoming: number; outgoing: number }[] {
    // Group dates in the same timezone as the employee's reporting workspace.
    const monthKey = (date: Date) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
      })
        .format(date)
        .slice(0, 7);
    const nowKey = monthKey(new Date());
    const [year, month] = nowKey.split('-').map(Number);
    return Array.from({ length: this.growthMonths }, (_, index) => {
      const date = new Date(Date.UTC(year, month - this.growthMonths + index, 1));
      const key = monthKey(date);
      const matches = (value: string | null) => {
        if (!value) return false;
        const parsed = new Date(value);
        return Number.isFinite(parsed.getTime()) && monthKey(parsed) === key;
      };
      return {
        label: new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          year: '2-digit',
        }).format(date),
        incoming: this.sumPaid(
          this.paymentHistory.filter((payment) => matches(payment.paymentDate)),
        ),
        outgoing: this.applications
          .filter(
            (loan) =>
              ['approved', 'disbursed', 'active', 'closed', 'completed'].includes(
                loan.status.trim().toLowerCase(),
              ) && matches(loan.reviewedDate),
          )
          .reduce((sum, loan) => sum + loan.loanAmount, 0),
      };
    });
  }

  get growthScale(): number {
    return Math.max(1, ...this.growthData.flatMap((month) => [month.incoming, month.outgoing]));
  }

  get hasDashboardAccess(): boolean {
    return this.loginService.isAllowedRole(this.employee?.role);
  }

  get totalPaid(): number {
    return Object.values(this.paymentSummary).reduce((sum, item) => sum + (item.paid ?? 0), 0);
  }

  get totalPending(): number {
    return Object.values(this.paymentSummary).reduce(
      (sum, item) => sum + (item.balance?.totalOutstanding ?? 0),
      0,
    );
  }

  get activeLoanCount(): number {
    return this.applications.filter((loan) =>
      ['approved', 'disbursed', 'active'].includes(loan.status.trim().toLowerCase()),
    ).length;
  }

  get customerCount(): number {
    return new Set(this.applications.map((loan) => loan.customerId)).size;
  }

  get overdueLoanCount(): number {
    return Object.values(this.paymentSummary).filter(
      (item) => (item.balance?.overdueAmount ?? 0) > 0,
    ).length;
  }

  get overdueAmount(): number {
    return Object.values(this.paymentSummary).reduce(
      (sum, item) => sum + (item.balance?.overdueAmount ?? 0),
      0,
    );
  }

  get todayCollections(): number {
    const today = this.reportingDateKey(new Date().toISOString());
    return this.paymentHistory
      .filter(
        (payment) =>
          this.reportingDateKey(payment.paymentDate) === today &&
          ['success', 'successful', 'completed', 'paid'].includes(
            (payment.paymentStatus ?? '').trim().toLowerCase(),
          ),
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  get todayPaymentCount(): number {
    const today = this.reportingDateKey(new Date().toISOString());
    return this.paymentHistory.filter(
      (payment) =>
        this.reportingDateKey(payment.paymentDate) === today &&
        ['success', 'successful', 'completed', 'paid'].includes(
          (payment.paymentStatus ?? '').trim().toLowerCase(),
        ),
    ).length;
  }

  get approvalQueue(): LoanApplication[] {
    return this.filteredApplications
      .filter((loan) => loan.status.trim().toLowerCase() === 'pending')
      .slice(0, 5);
  }

  get recentPayments(): PaymentHistory[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.paymentHistory
      .filter((payment) =>
        [
          payment.customerId,
          payment.loanId,
          payment.paymentReference,
          payment.paymentStatus,
          payment.paymentMethod,
        ].some((value) => String(value ?? '').toLowerCase().includes(query)),
      )
      .slice()
      .sort((a, b) => (Date.parse(b.paymentDate) || 0) - (Date.parse(a.paymentDate) || 0))
      .slice(0, 5);
  }

  get collectionChartScale(): number {
    return Math.max(1, ...this.growthData.map((month) => month.incoming));
  }

  collectionHeight(amount: number): number {
    return amount > 0 ? Math.max(8, (amount / this.collectionChartScale) * 100) : 0;
  }

  paymentDateLabel(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  get paymentDataIncomplete(): boolean {
    return Object.values(this.paymentSummary).some(
      (item) => item.paid === null || item.balance === null,
    );
  }

  get notifications(): { message: string; loanId?: number }[] {
    const items: { message: string; loanId?: number }[] = [];
    if (this.pendingCount)
      items.push({
        message: `${this.pendingCount} loan application(s) awaiting approval or rejection.`,
      });
    for (const [id, item] of Object.entries(this.paymentSummary)) {
      if (item.balance && item.balance.overdueAmount > 0) {
        items.push({
          message: `Loan #${id} has an overdue payment. Review its outstanding balance.`,
          loanId: Number(id),
        });
      }
    }
    if (this.paymentDataIncomplete)
      items.push({ message: 'Some payment details could not be loaded. Refresh to try again.' });
    return items;
  }

  private loadPaymentSummary(): void {
    const loans = this.applications.filter(
      (loan) => !['pending', 'rejected'].includes(loan.status.toLowerCase()),
    );
    this.paymentsLoading = loans.length > 0;
    if (!loans.length) return;
    this.paymentSubscription = forkJoin(
      loans.map((loan) =>
        forkJoin({
          history: this.payments
            .getHistory(loan.loanApplicationId)
            .pipe(catchError(() => of(null))),
          balance: this.payments
            .getOutstanding(loan.loanApplicationId)
            .pipe(catchError(() => of(null))),
        }).pipe(
          map(({ history, balance }) => ({
            id: loan.loanApplicationId,
            paid: history === null ? null : this.sumPaid(history),
            history: history ?? [],
            balance,
          })),
        ),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows) => {
        this.paymentHistory = rows.flatMap((row) => row.history);
        this.paymentSummary = Object.fromEntries(
          rows.map((row) => [row.id, { paid: row.paid, balance: row.balance }]),
        );
        this.paymentsLoading = false;
        this.cdr.markForCheck();
      });
  }

  private sumPaid(history: PaymentHistory[]): number {
    return history
      .filter((payment) =>
        ['success', 'successful', 'completed', 'paid'].includes(
          (payment.paymentStatus ?? '').trim().toLowerCase(),
        ),
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  private reportingDateKey(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  employee = this.loginService.getEmployee();
  applications: LoanApplication[] = [];
  loading = true;
  errorMessage = '';
  searchTerm = '';

  ngOnInit(): void {
    if (this.hasDashboardAccess) this.loadApplications();
  }

  get filteredApplications(): LoanApplication[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.applications.filter((loan) =>
      [loan.loanApplicationId, loan.customerId, loan.loanType, loan.status].some((value) =>
        String(value).toLowerCase().includes(query),
      ),
    );
  }

  loadApplications(): void {
    if (!this.hasDashboardAccess) return;
    this.applicationSubscription?.unsubscribe();
    this.paymentSubscription?.unsubscribe();
    this.paymentSummary = {};
    this.paymentHistory = [];
    this.paymentsLoading = false;
    this.loading = true;
    this.errorMessage = '';
    this.applicationSubscription = this.loans
      .getApplications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.applications = data;
          this.loading = false;
          this.loadPaymentSummary();
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Unable to load loan applications.';
          this.cdr.markForCheck();
        },
      });
  }

  get pendingCount(): number {
    return this.applications.filter((x) => x.status?.toLowerCase() === 'pending').length;
  }

  get approvedCount(): number {
    return this.applications.filter((x) => x.status?.toLowerCase() === 'approved').length;
  }

  get rejectedCount(): number {
    return this.applications.filter((x) => x.status?.toLowerCase() === 'rejected').length;
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
