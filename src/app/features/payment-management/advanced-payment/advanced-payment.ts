import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment';

@Component({
  selector: 'app-advanced-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-payment.html',
  styleUrl: './advanced-payment.css'
})
export class AdvancedPayment {

  private paymentService = inject(PaymentService);

  penalty = {
    loanId: 0,
    emiId: 0,
    amount: 0,
    reason: ''
  };

  closureLoanId = 0;
  message = '';
  error = '';
  loading = false;

  addPenalty() {
    this.message = '';
    this.error = '';

    if (this.penalty.loanId <= 0 ||
        this.penalty.emiId <= 0 ||
        this.penalty.amount <= 0) {
      this.error = 'Enter valid penalty details.';
      return;
    }

    this.loading = true;

    this.paymentService.createPenalty(this.penalty).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Penalty created successfully.';
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.detail || 'Unable to create penalty.';
      }
    });
  }

  closeLoan() {
    this.message = '';
    this.error = '';

    if (this.closureLoanId <= 0) {
      this.error = 'Enter a valid Loan ID.';
      return;
    }

    if (!confirm('Are you sure you want to close this loan?')) {
      return;
    }

    this.loading = true;

    this.paymentService.closeLoan(this.closureLoanId).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Loan closure request succeeded.';
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.detail || 'Unable to close loan.';
      }
    });
  }
}