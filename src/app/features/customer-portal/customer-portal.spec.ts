import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CustomerAuthService } from '../../core/services/customer-auth';
import { CustomerManagementService } from '../../core/services/customer-management';
import { EmiAllocationService } from '../../core/services/emi-allocation';
import { PaymentService } from '../../core/services/payment';
import { CustomerPortalComponent } from './customer-portal';
import { EmiOutstanding } from '../../core/services/emi-allocation';
import { PaymentHistory } from '../../core/services/payment';

describe('CustomerPortalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPortalComponent],
      providers: [
        provideRouter([]),
        {
          provide: CustomerAuthService,
          useValue: {
            getCustomer: () => ({
              customerId: 9,
              fullName: 'Test Customer',
              email: 'customer@example.com',
              token: 'customer-token',
            }),
            logout: vi.fn(),
          },
        },
        {
          provide: CustomerManagementService,
          useValue: {
            getProfile: () =>
              of({
                customerId: 9,
                fullName: 'Test Customer',
                email: 'customer@example.com',
                phoneNumber: '1234567890',
                dateOfBirth: null,
                gender: null,
                createdAt: '',
                isActive: true,
              }),
            getKycDocuments: () => of([]),
            getEligibility: () =>
              of({
                customerId: 9,
                monthlyIncome: 0,
                employmentType: '',
                employmentStatus: '',
                employerName: null,
                employmentExperienceYears: 0,
                creditScore: 0,
                existingLoanCount: 0,
                existingMonthlyObligations: 0,
                existingLoanAmount: 0,
                financialProfileRemarks: null,
              }),
          },
        },
        { provide: EmiAllocationService, useValue: { getOutstanding: vi.fn() } },
        { provide: PaymentService, useValue: { getHistory: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('shows the customer Payments section from the portal navigation', async () => {
    const fixture = TestBed.createComponent(CustomerPortalComponent);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.sidebar button:nth-of-type(4)').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-customer-payments')).not.toBeNull();
  });

  it('loads live customer EMI and payment history into the dashboard', async () => {
    const outstanding: EmiOutstanding = {
      loanId: 42,
      totalEmiAmount: 1000,
      totalPaid: 400,
      totalOutstanding: 600,
      overdueAmount: 0,
      emis: [
        {
          emiId: 5,
          loanId: 42,
          emiAmount: 600,
          amountPaid: 0,
          remainingAmount: 600,
          dueDate: '2026-11-01',
          status: 'Pending',
        },
      ],
    };
    const history: PaymentHistory[] = [
      {
        paymentId: 3,
        customerId: 9,
        loanId: 42,
        amount: 400,
        paymentDate: '2026-10-01',
        paymentMethod: 'UPI',
        paymentReference: 'txn-3',
        paymentStatus: 'Completed',
      },
    ];
    const fixture = TestBed.createComponent(CustomerPortalComponent);
    const component = fixture.componentInstance;
    const emiService = TestBed.inject(EmiAllocationService);
    const paymentService = TestBed.inject(PaymentService);
    vi.mocked(emiService.getOutstanding).mockReturnValue(of(outstanding));
    vi.mocked(paymentService.getHistory).mockReturnValue(of(history));
    component.dashboardLoanId = 42;
    component.loadDashboardLoan();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emiService.getOutstanding).toHaveBeenCalledWith(42, true);
    expect(paymentService.getHistory).toHaveBeenCalledWith(42, true);
    expect(component.dashboardOutstanding).toEqual(outstanding);
    expect(component.recentPayments).toEqual(history);
    expect(component.nextEmi?.emiId).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('Outstanding balance');
    expect(fixture.nativeElement.textContent).toContain('Recent payments');
  });
});
