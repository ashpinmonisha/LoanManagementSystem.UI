import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EmiAllocationService,
  EmiOutstanding,
  EmiAllocationResult
} from '../../../core/services/emi-allocation';

@Component({
  selector: 'app-emi-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emi-balance.html',
  styleUrl: './emi-balance.css'
})
export class EmiBalance {

  private service = inject(EmiAllocationService);

  loanId = 0;
  paymentId = 0;
  emiId = 0;

  loading = false;
  allocating = false;

  error = '';
  success = '';

  outstanding: EmiOutstanding | null = null;
  allocation: EmiAllocationResult | null = null;

  loadBalance() {
    if (this.loanId <= 0) return;

    this.loading = true;
    this.error = '';
    this.outstanding = null;

    this.service.getOutstanding(this.loanId)
      .subscribe({
        next: data => {
          this.outstanding = data;
          this.loading = false;
        },
        error: err => {
          this.error =
            err.error?.message ||
            'Unable to load EMI balance.';
          this.loading = false;
        }
      });
  }

  allocatePayment() {
    if (this.paymentId <= 0 || this.emiId <= 0) {
      this.error = 'Enter valid Payment ID and EMI ID.';
      return;
    }

    this.allocating = true;
    this.error = '';
    this.success = '';
    this.allocation = null;

    this.service.allocate(this.paymentId, this.emiId)
      .subscribe({
        next: result => {
          this.allocation = result;
          this.allocating = false;

          this.success =
            'Payment allocated successfully.';

          if (this.loanId > 0) {
            this.loadBalance();
          }
        },
        error: err => {
          this.allocating = false;

          this.error =
            err.error?.message ||
            'Allocation failed. Check status before retrying.';
        }
      });
  }

  percentage(emi: {
    emiAmount: number;
    amountPaid: number;
  }): number {
    if (emi.emiAmount <= 0) return 0;

    return Math.max(
      0,
      Math.min(
        100,
        emi.amountPaid / emi.emiAmount * 100
      )
    );
  }
}