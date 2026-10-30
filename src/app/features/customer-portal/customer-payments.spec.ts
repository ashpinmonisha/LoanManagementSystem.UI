import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EmiAllocationService } from '../../core/services/emi-allocation';
import { PaymentService } from '../../core/services/payment';
import { CustomerPaymentsComponent } from './customer-payments';

describe('CustomerPaymentsComponent', () => {
  const emis = {
    getOutstanding: vi.fn(),
  };
  const payments = {
    getHistory: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    emis.getOutstanding.mockReturnValue(
      of({
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
          {
            emiId: 6,
            loanId: 42,
            emiAmount: 400,
            amountPaid: 400,
            remainingAmount: 0,
            dueDate: '2026-12-01',
            status: 'Paid',
          },
        ],
      }),
    );
    payments.getHistory.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      imports: [CustomerPaymentsComponent],
      providers: [
        { provide: EmiAllocationService, useValue: emis },
        { provide: PaymentService, useValue: payments },
      ],
    });
  });

  it('loads EMI balance and payment history using customer-session requests', async () => {
    const fixture = TestBed.createComponent(CustomerPaymentsComponent);
    const component = fixture.componentInstance;
    component.customerId = 9;
    component.loanId = 42;
    component.loadLoan();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emis.getOutstanding).toHaveBeenCalledWith(42, true);
    expect(payments.getHistory).toHaveBeenCalledWith(42, true);
    expect(component.selectedEmi?.emiId).toBe(5);
    expect(component.payableEmis).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('600');
  });

  it('requires a positive loan ID before requesting payment information', () => {
    const fixture = TestBed.createComponent(CustomerPaymentsComponent);
    const component = fixture.componentInstance;
    component.loanId = 0;
    component.loadLoan();

    expect(component.error).toBe('Enter a valid loan ID.');
    expect(emis.getOutstanding).not.toHaveBeenCalled();
    expect(payments.getHistory).not.toHaveBeenCalled();
  });

  it('loads the selected dashboard loan when the customer opens Payments', async () => {
    const fixture = TestBed.createComponent(CustomerPaymentsComponent);
    fixture.componentRef.setInput('customerId', 9);
    fixture.componentRef.setInput('initialLoanId', 42);
    await fixture.whenStable();

    expect(emis.getOutstanding).toHaveBeenCalledWith(42, true);
    expect(payments.getHistory).toHaveBeenCalledWith(42, true);
    expect(fixture.componentInstance.loanId).toBe(42);
  });

  it('refreshes its data and notifies the dashboard after a verified payment', () => {
    const fixture = TestBed.createComponent(CustomerPaymentsComponent);
    const component = fixture.componentInstance;
    component.loanId = 42;
    const updated = vi.fn();
    component.paymentUpdated.subscribe(updated);

    component.refreshAfterPayment();

    expect(emis.getOutstanding).toHaveBeenCalledWith(42, true);
    expect(payments.getHistory).toHaveBeenCalledWith(42, true);
    expect(updated).toHaveBeenCalledOnce();
  });
});
