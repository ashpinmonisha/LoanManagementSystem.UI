import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';
import { DashboardComponent } from './Dashboard';
import { LoginService } from '../login/login/login.service';
import { LoanApplicationService } from '../loan-application/loan-application/loan-application.service';
import { PaymentService, PaymentHistory, OutstandingBalance } from '../../core/services/payment';
import { LoanApplication } from '../../core/models/loan.model';

const loan = (id: number, status: string): LoanApplication => ({
  loanApplicationId: id,
  status,
  customerId: id,
  loanType: 'Personal',
  loanAmount: 10000,
  loanTenure: 12,
  loanPurpose: '',
  applicationDate: '',
  remarks: null,
  reviewedByEmployeeId: null,
  reviewedDate: null,
});
const payment = (amount: number, paymentStatus: string): PaymentHistory => ({
  paymentId: 1,
  customerId: 1,
  loanId: 1,
  amount,
  paymentStatus,
  paymentDate: '',
  paymentMethod: '',
  paymentReference: '',
});
const balance: OutstandingBalance = {
  loanId: 1,
  remainingPrincipal: 7000,
  remainingInterest: 1000,
  pendingEmiAmount: 500,
  overdueAmount: 500,
  penaltyAmount: 0,
  totalOutstanding: 8000,
};

describe('Employee dashboard', () => {
  let employee: boolean;
  let role: string;
  let fragment: BehaviorSubject<string | null>;
  const loans = { getApplications: vi.fn() };
  const payments = { getHistory: vi.fn(), getOutstanding: vi.fn() };

  beforeEach(() => {
    employee = true;
    role = 'Employee';
    fragment = new BehaviorSubject<string | null>(null);
    loans.getApplications.mockReturnValue(
      of([loan(1, 'Approved'), loan(2, 'Pending'), loan(3, 'Rejected')]),
    );
    payments.getHistory.mockReturnValue(
      of([payment(2000, 'Success'), payment(500, 'Failed'), payment(600, 'Pending')]),
    );
    payments.getOutstanding.mockReturnValue(of(balance));
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { fragment } },
        { provide: LoanApplicationService, useValue: loans },
        { provide: PaymentService, useValue: payments },
        {
          provide: LoginService,
          useValue: {
            isEmployee: () => employee,
            isAllowedRole: (candidate: string | undefined) =>
              ['admin', 'manager', 'employee'].includes(candidate?.trim().toLowerCase() ?? ''),
            getEmployee: () => ({
              employeeName: 'Employee',
              role,
            }),
          },
        },
      ],
    });
  });

  afterEach(() => vi.clearAllMocks());

  it('shows paid and pending totals, decision links and actionable notifications', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    expect(component.totalPaid).toBe(2000);
    expect(component.totalPending).toBe(8000);
    expect(component.pendingCount).toBe(1);
    expect(component.approvedCount).toBe(1);
    expect(component.rejectedCount).toBe(1);
    expect(component.notifications).toHaveLength(2);
    expect(payments.getHistory).toHaveBeenCalledExactlyOnceWith(1);
    expect(payments.getOutstanding).toHaveBeenCalledExactlyOnceWith(1);
    fragment.next('applications');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a[href="/loan-approval/2"]').textContent).toContain(
      'Approve / Reject',
    );
    fragment.next('notifications');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('overdue payment');
  });

  it('calculates overview metrics from loaded applications and successful payments', async () => {
    loans.getApplications.mockReturnValue(
      of([loan(1, 'Active'), loan(2, 'Pending'), loan(3, 'Rejected'), loan(4, 'Approved')]),
    );
    const todayPayments = [
      { ...payment(250, 'Completed'), customerId: 7, paymentDate: new Date().toISOString() },
      { ...payment(800, 'Failed'), customerId: 7, paymentDate: new Date().toISOString() },
    ];
    payments.getHistory.mockImplementation((loanId: number) => of(loanId === 1 ? todayPayments : []));
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const component = fixture.componentInstance;

    expect(component.activeLoanCount).toBe(2);
    expect(component.customerCount).toBe(4);
    expect(component.todayCollections).toBe(250);
    expect(component.todayPaymentCount).toBe(1);
    expect(component.overdueLoanCount).toBe(2);
    expect(component.overdueAmount).toBe(1000);
    expect(component.approvalQueue.map((application) => application.loanApplicationId)).toEqual([2]);
    expect(fixture.nativeElement.querySelector('.employee-overview')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Monthly collections');
  });

  it('shows pending application notifications while payment requests are still loading', async () => {
    payments.getHistory.mockReturnValue(NEVER);
    fragment.next('notifications');
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    expect(fixture.componentInstance.paymentsLoading).toBe(true);
    const panel = fixture.nativeElement.querySelector('#notifications');
    expect(panel.textContent).toContain('1 loan application(s) awaiting approval or rejection.');
    expect(panel.textContent).toContain('Loading payment alerts...');
    expect(panel.textContent).not.toContain('No items need attention.');
    expect(panel.querySelector('a').getAttribute('href')).toBe('/dashboard#applications');
  });

  it('labels totals as incomplete when a payment API fails', async () => {
    payments.getHistory.mockReturnValue(throwError(() => new Error('Unavailable')));
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    expect(fixture.componentInstance.paymentDataIncomplete).toBe(true);
    expect(fixture.componentInstance.paymentSummary[1].paid).toBeNull();
    expect(fixture.componentInstance.totalPending).toBe(8000);
    fragment.next('payment-summary');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Totals are incomplete');
    fragment.next('applications');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Unavailable');
  });

  it('compares received repayments with approved amounts and groups dated records by month', async () => {
    const today = new Date().toISOString();
    loans.getApplications.mockReturnValue(of([
      { ...loan(1, 'Approved'), reviewedDate: today }, loan(2, 'Pending'), loan(3, 'Rejected')
    ]));
    payments.getHistory.mockReturnValue(of([
      { ...payment(2000, 'Success'), paymentDate: today },
      { ...payment(900, 'Failed'), paymentDate: today },
      { ...payment(100, 'Paid'), paymentDate: 'invalid' }
    ]));
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    expect(component.approvedLoanAmount).toBe(10000);
    expect(component.totalPaid).toBe(2100);
    expect(component.netMovement).toBe(-7900);
    expect(component.collectionRatio).toBe(21);
    expect(component.growthData).toHaveLength(6);
    expect(component.growthData.at(-1)).toMatchObject({ incoming: 2000, outgoing: 10000 });
    expect(component.growthData.slice(0, -1).every(month => month.incoming === 0 && month.outgoing === 0)).toBe(true);
    fragment.next('growth');
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll('.period-switch button');
    buttons[1].click();
    await fixture.whenStable();
    expect(component.growthData).toHaveLength(12);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('shows only the selected sidebar page and opens loan links in applications', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.stats')).not.toBeNull();
    for (const page of ['growth', 'applications', 'payment-summary', 'notifications']) {
      fragment.next(page);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.stats')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('main > .applications-panel')).toHaveLength(1);
      expect(fixture.nativeElement.querySelector('main > .applications-panel').id).toBe(page);
      expect(fixture.nativeElement.querySelector('.sidebar a.active').getAttribute('href')).toBe('/dashboard#' + page);
    }
    fragment.next('loan-1');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#loan-1')).not.toBeNull();
    fragment.next(null);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.stats')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.applications-panel')).toBeNull();
  });

  it('renders and loads the dashboard for an authorized manager role', async () => {
    role = 'Manager';
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.dashboard')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.employee-name small').textContent).toContain('Manager');
    expect(loans.getApplications).toHaveBeenCalledOnce();
  });

  it('handles an empty portfolio without invalid ratios or chart values', async () => {
    loans.getApplications.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    expect(component.approvedLoanAmount).toBe(0);
    expect(component.netMovement).toBe(0);
    expect(component.collectionRatio).toBeNull();
    expect(component.growthScale).toBe(1);
    expect(component.growthData.every(month => month.incoming === 0 && month.outgoing === 0)).toBe(true);
  });

  it('does not show employee content or fetch loan data for a different role', async () => {
    employee = false;
    role = 'Customer';
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.dashboard')).toBeNull();
    expect(loans.getApplications).not.toHaveBeenCalled();
    expect(payments.getHistory).not.toHaveBeenCalled();
  });
});
