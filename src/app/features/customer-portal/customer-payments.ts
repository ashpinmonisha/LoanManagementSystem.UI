import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EmiAllocationService,
  EmiDetails,
  EmiOutstanding,
} from '../../core/services/emi-allocation';
import { PaymentHistory, PaymentService } from '../../core/services/payment';
import { RazorpayCheckout } from '../payment-management/razorpay-checkout/razorpay-checkout';

@Component({
  selector: 'app-customer-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, RazorpayCheckout],
  templateUrl: './customer-payments.html',
  styleUrl: './customer-payments.css',
})
export class CustomerPaymentsComponent implements OnChanges {
  private readonly emis = inject(EmiAllocationService);
  private readonly payments = inject(PaymentService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() customerId = 0;
  @Input() initialLoanId: number | null = null;
  @Output() paymentUpdated = new EventEmitter<void>();

  loanId: number | null = null;
  outstanding: EmiOutstanding | null = null;
  history: PaymentHistory[] = [];
  selectedEmiId: number | null = null;
  loading = false;
  historyLoading = false;
  error = '';
  historyError = '';

  ngOnChanges(changes: SimpleChanges): void {
    const loanId = changes['initialLoanId']?.currentValue as number | null | undefined;
    if (Number.isInteger(loanId) && loanId && loanId > 0) {
      this.loanId = loanId;
      this.loadLoan();
    }
  }

  get payableEmis(): EmiDetails[] {
    return (this.outstanding?.emis ?? []).filter(
      (emi) => emi.remainingAmount > 0 && !['paid', 'completed'].includes(emi.status.toLowerCase()),
    );
  }

  get selectedEmi(): EmiDetails | null {
    return this.payableEmis.find((emi) => emi.emiId === this.selectedEmiId) ?? null;
  }

  loadLoan(): void {
    this.error = '';
    this.historyError = '';
    this.outstanding = null;
    this.history = [];
    this.selectedEmiId = null;

    if (!Number.isInteger(this.loanId) || !this.loanId || this.loanId < 1) {
      this.error = 'Enter a valid loan ID.';
      return;
    }

    this.loading = true;
    this.historyLoading = true;
    this.emis.getOutstanding(this.loanId, true).subscribe({
      next: (data) => {
        this.outstanding = data;
        this.selectedEmiId = this.payableEmis[0]?.emiId ?? null;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.error = this.messageFor(error, 'Unable to load EMIs for this loan.');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    this.payments.getHistory(this.loanId, true).subscribe({
      next: (history) => {
        this.history = history;
        this.historyLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.historyError = this.messageFor(error, 'Unable to load payment history.');
        this.historyLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  refreshAfterPayment(): void {
    this.loadLoan();
    this.paymentUpdated.emit();
  }

  private messageFor(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 0) {
      return 'Cannot connect to the payment API. Check that the backend and HTTPS certificate are running.';
    }
    if (error.status === 401) return 'Your customer session has expired. Sign in again.';
    if (error.status === 403 || error.status === 404) {
      return 'This loan could not be found for your customer account.';
    }
    return error.error?.message ?? error.error?.title ?? fallback;
  }
}
