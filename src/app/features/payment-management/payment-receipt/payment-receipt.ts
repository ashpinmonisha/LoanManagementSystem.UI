import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PaymentReceipt,
  PaymentReceiptService
} from '../../../core/services/payment-receipt.service';

@Component({
  selector: 'app-payment-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-receipt.html',
  styleUrl: './payment-receipt.css'
})
export class PaymentReceiptComponent {
  private receiptService = inject(PaymentReceiptService);

  paymentId: number | null = null;
  loanId: number | null = null;

  receipt: PaymentReceipt | null = null;
  receipts: PaymentReceipt[] = [];

  loading = false;
  error = '';
  success = '';

  generateReceipt(): void {
    if (!this.paymentId || this.paymentId <= 0) {
      this.error = 'Enter a valid Payment ID';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.receiptService.generate(this.paymentId).subscribe({
      next: result => {
        this.receipt = result;
        this.success = 'Payment receipt is ready';
        this.loading = false;
      },
      error: err => this.handleError(err)
    });
  }

  viewReceipt(): void {
    if (!this.paymentId || this.paymentId <= 0) {
      this.error = 'Enter a valid Payment ID';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.receiptService.get(this.paymentId).subscribe({
      next: result => {
        this.receipt = result;
        this.loading = false;
      },
      error: err => this.handleError(err)
    });
  }

  loadHistory(): void {
    if (!this.loanId || this.loanId <= 0) {
      this.error = 'Enter a valid Loan ID';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.receiptService.getByLoan(this.loanId).subscribe({
      next: result => {
        this.receipts = result;
        this.loading = false;
      },
      error: err => this.handleError(err)
    });
  }

  downloadReceipt(paymentId: number): void {
    this.error = '';

    this.receiptService.download(paymentId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `Receipt-${paymentId}.pdf`;
        link.click();

        URL.revokeObjectURL(url);
      },
      error: err => this.handleError(err)
    });
  }

  private handleError(err: any): void {
    this.loading = false;

    if (err.status === 0) {
      this.error = 'Cannot connect to backend API';
    } else if (err.status === 401) {
      this.error = 'Session expired or invalid JWT. Please log in again.';
    } else if (err.status === 403) {
      this.error = 'You do not have permission to access this receipt.';
    } else if (err.status === 404) {
      this.error = 'Payment receipt not found';
    } else if (err.status === 409) {
      this.error =
        err.error?.message || 'Payment is not completed';
    } else {
      this.error =
        err.error?.message || 'Unable to process receipt';
    }
  }
}