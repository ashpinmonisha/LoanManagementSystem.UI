import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, RecordPayment } from '../../../core/services/payment';
import { PaymentReceipt, PaymentReceiptService } from '../../../core/services/payment-receipt';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css'
})
export class PaymentForm {

  private paymentService = inject(PaymentService);
  private readonly receipts = inject(PaymentReceiptService);
  private readonly cdr = inject(ChangeDetectorRef);
  receipt: PaymentReceipt | null = null;

  downloadReceipt(): void {
    if (this.receipt) this.receipts.download(this.receipt);
  }

  loading = false;
  success = '';
  error = '';

  payment: RecordPayment = {
    customerId: 0,
    loanId: 0,
    emiId: 0,
    amount: 0,
    paymentDate: new Date().toISOString(),
    paymentMethod: 'UPI',
    paymentReference: ''
  };

  submitPayment() {
    if (this.loading) return;
    this.receipt = null;
    this.success = '';
    this.error = '';

    if (
      this.payment.customerId <= 0 ||
      this.payment.loanId <= 0 ||
      this.payment.amount <= 0 ||
      !this.payment.paymentReference.trim()
    ) {
      this.error = 'Please enter valid payment details.';
      return;
    }

    this.loading = true;

    const request = { ...this.payment };
    this.paymentService.recordPayment(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.receipt = this.receipts.create(request, response);
        this.success =
          `Payment recorded successfully. ID: ${response.paymentId}`;
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
