import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PaymentRefundService,
  RefundResponseDto
} from '../../../core/services/payment-refund';

@Component({
  selector: 'app-payment-refund',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-refund.html',
  styleUrl: './payment-refund.css'
})
export class PaymentRefundComponent {
  private refundService = inject(PaymentRefundService);

  paymentId: number | null = null;
  amount: number | null = null;
  reason = '';

  historyPaymentId: number | null = null;
  refundId: number | null = null;
  rejectionReason = '';

  refund: RefundResponseDto | null = null;
  refunds: RefundResponseDto[] = [];

  loading = false;
  error = '';
  success = '';

  requestRefund(): void {
    if (!this.paymentId || !this.amount ||
        this.amount <= 0 || !this.reason.trim()) {
      this.error = 'Enter valid payment ID, amount and reason.';
      return;
    }

    this.run(() => this.refundService.requestRefund({
      paymentId: this.paymentId!,
      amount: this.amount!,
      reason: this.reason.trim()
    }), 'Refund request submitted.');
  }

  approveRefund(id: number): void {
    this.run(
      () => this.refundService.approveRefund(id),
      'Refund approved.'
    );
  }

  rejectRefund(id: number): void {
    if (!this.rejectionReason.trim()) {
      this.error = 'Enter a rejection reason.';
      return;
    }

    this.run(
      () => this.refundService.rejectRefund(
        id, this.rejectionReason.trim()),
      'Refund rejected.'
    );
  }

  processRefund(id: number): void {
    if (!confirm('Submit this approved refund to Razorpay?')) {
      return;
    }

    this.run(
      () => this.refundService.processRefund(id),
      'Refund processing request submitted. Verify final status.'
    );
  }

  checkStatus(id: number): void {
    this.run(
      () => this.refundService.checkStatus(id),
      'Refund status refreshed.'
    );
  }

  loadHistory(): void {
    if (!this.historyPaymentId || this.historyPaymentId <= 0) {
      this.error = 'Enter a valid Payment ID.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.refundService.getHistory(this.historyPaymentId)
      .subscribe({
        next: result => {
          this.refunds = result;
          this.loading = false;
        },
        error: err => this.handleError(err)
      });
  }

  private run(
    request: () => import('rxjs').Observable<RefundResponseDto>,
    message: string
  ): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    request().subscribe({
      next: result => {
        this.refund = result;
        this.refundId = result.refundId;
        this.success = message;
        this.loading = false;

        if (this.historyPaymentId === result.paymentId) {
          this.loadHistory();
        }
      },
      error: err => this.handleError(err)
    });
  }

  private handleError(err: any): void {
    this.loading = false;

    if (err.status === 0) {
      this.error = 'Cannot connect to the backend API.';
    } else if (err.status === 401) {
      this.error = 'Unauthorized. Please log in with a valid JWT.';
    } else if (err.status === 403) {
      this.error = 'You do not have permission for this action.';
    } else if (err.status === 409) {
      this.error = err.error?.message || 'Refund conflict.';
    } else if (err.status === 404) {
      this.error = 'Refund not found.';
    } else {
      this.error = err.error?.message || 'Request failed.';
    }
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'Approved': return 'bg-primary';
      case 'Pending': return 'bg-warning text-dark';
      case 'Processing': return 'bg-info text-dark';
      case 'Rejected': return 'bg-secondary';
      case 'Failed': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
