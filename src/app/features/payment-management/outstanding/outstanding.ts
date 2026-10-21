import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PaymentService,
  OutstandingBalance
} from '../../../core/services/payment';

@Component({
  selector: 'app-outstanding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './outstanding.html',
  styleUrl: './outstanding.css'
})
export class Outstanding {

  private paymentService = inject(PaymentService);

  loanId = 0;
  balance: OutstandingBalance | null = null;
  loading = false;
  error = '';

  loadBalance() {
    if (this.loanId <= 0) {
      this.error = 'Enter a valid Loan ID.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.balance = null;

    this.paymentService.getOutstanding(this.loanId).subscribe({
      next: (data) => {
        this.balance = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load outstanding balance.';
        this.loading = false;
      }
    });
  }
}