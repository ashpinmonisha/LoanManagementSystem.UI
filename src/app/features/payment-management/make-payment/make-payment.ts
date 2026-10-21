import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment';
import { PaymentReceipt, PaymentReceiptService } from '../../../core/services/payment-receipt';

@Component({
  selector: 'app-make-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-payment.html',
  styleUrl: './make-payment.css'
})
export class MakePayment {

  private paymentService = inject(PaymentService);
  private readonly receipts = inject(PaymentReceiptService);
  private readonly cdr = inject(ChangeDetectorRef);
  receipt: PaymentReceipt | null = null;

  downloadReceipt(): void {
    if (this.receipt) this.receipts.download(this.receipt);
  }

  loading = false;
  message = '';
  error = '';
  paymentResult: any = null;

  payment = {
    customerId: 0,
    loanId: 0,
    emiId: 0,
    amount: 0,
    paymentMethod: 'UPI',
    paymentReference: ''
  };

  payNow() {
    if (this.loading) return;
    this.message = '';
    this.error = '';
    this.paymentResult = null;
    this.receipt = null;

    if (
      this.payment.customerId <= 0 ||
      this.payment.loanId <= 0 ||
      this.payment.emiId <= 0 ||
      this.payment.amount <= 0 ||
      !this.payment.paymentReference.trim()
    ) {
      this.error = 'Please enter valid payment details.';
      return;
    }

    this.loading = true;

    const request = {
      ...this.payment,
      paymentDate: new Date().toISOString()
    };

    this.paymentService.recordPayment(request).subscribe({
      next: (result) => {
        this.loading = false;
        this.paymentResult = result;
        this.receipt = this.receipts.create(request, result);
        this.message =
          'Payment recorded. Awaiting transaction verification.';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.detail ||
          err.error?.message ||
          'Unable to record payment.';
        this.cdr.markForCheck();
      }
    });
  }
}
