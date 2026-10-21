import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PaymentService,
  PaymentHistory as PaymentHistoryModel
} from '../../../core/services/payment';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.css'
})
export class PaymentHistory {

  private paymentService = inject(PaymentService);

  loanId = 0;
  payments: PaymentHistoryModel[] = [];
  loading = false;
  error = '';

  loadHistory() {
    if (this.loanId <= 0) {
      this.error = 'Enter a valid Loan ID.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.payments = [];

    this.paymentService.getHistory(this.loanId).subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load payment history.';
        this.loading = false;
      }
    });
  }
}