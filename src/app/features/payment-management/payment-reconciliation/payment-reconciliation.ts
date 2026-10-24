import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PaymentReconciliationService,
  ReconciliationResponseDto,
  ReconciliationReportDto
} from '../../../core/services/payment-reconciliation';

type ViewTab = 'verify' | 'bulk' | 'history' | 'mismatches';

@Component({
  selector: 'app-payment-reconciliation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-reconciliation.html',
  styleUrl: './payment-reconciliation.css'
})
export class PaymentReconciliationComponent implements OnInit {
  private readonly service =
    inject(PaymentReconciliationService);

  activeTab: ViewTab = 'verify';

  paymentId: number | null = null;
  historyPaymentId: number | null = null;
  bulkLimit = 20;

  report: ReconciliationReportDto | null = null;
  latestResult: ReconciliationResponseDto | null = null;

  bulkResults: ReconciliationResponseDto[] = [];
  history: ReconciliationResponseDto[] = [];
  mismatches: ReconciliationResponseDto[] = [];

  loading = false;
  reportLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadReport();
  }

  setTab(tab: ViewTab): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';

    if (tab === 'mismatches') {
      this.loadMismatches();
    }
  }

  verifyPayment(): void {
    if (!this.isValidId(this.paymentId)) {
      this.errorMessage = 'Enter a valid Payment ID.';
      return;
    }

    this.execute(
      this.service.verifyPayment(this.paymentId!),
      result => {
        this.latestResult = result;
        this.successMessage =
          `Payment ${result.paymentId} checked: ${result.result}`;
        this.loadReport();
      }
    );
  }

  runBulk(): void {
    if (!Number.isInteger(this.bulkLimit) ||
        this.bulkLimit < 1 ||
        this.bulkLimit > 100) {
      this.errorMessage =
        'Bulk limit must be between 1 and 100.';
      return;
    }

    if (!confirm(
      `Reconcile the latest ${this.bulkLimit} payments?`
    )) {
      return;
    }

    this.execute(
      this.service.bulkReconcile(this.bulkLimit),
      results => {
        this.bulkResults = results;
        this.successMessage =
          `${results.length} payments checked.`;
        this.loadReport();
      }
    );
  }

  loadHistory(): void {
    if (!this.isValidId(this.historyPaymentId)) {
      this.errorMessage = 'Enter a valid Payment ID.';
      return;
    }

    this.execute(
      this.service.getHistory(this.historyPaymentId!),
      results => {
        this.history = results;
        this.successMessage =
          `${results.length} history records found.`;
      }
    );
  }

  loadMismatches(): void {
    this.execute(
      this.service.getMismatches(),
      results => {
        this.mismatches = results;
      }
    );
  }

  loadReport(): void {
    this.reportLoading = true;

    this.service.getReport().subscribe({
      next: result => {
        this.report = result;
        this.reportLoading = false;
      },
      error: err => {
        this.reportLoading = false;
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  private execute<T>(
    request: Observable<T>,
    onSuccess: (result: T) => void
  ): void {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    request.subscribe({
      next: result => {
        this.loading = false;
        onSuccess(result);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  private isValidId(value: number | null): boolean {
    return value !== null &&
      Number.isInteger(value) &&
      value > 0;
  }

  private getErrorMessage(
    err: HttpErrorResponse
  ): string {
    if (err.status === 0) {
      return 'Cannot connect to backend. Check API, HTTPS certificate and CORS.';
    }

    if (err.status === 401) {
      return '401 Unauthorized. Log in again and check your JWT token.';
    }

    if (err.status === 403) {
      return '403 Forbidden. Admin or Manager permission is required.';
    }

    if (err.status === 404) {
      return 'Payment or API endpoint not found.';
    }

    if (err.status === 429) {
      return 'Too many requests. Try again later.';
    }

    return err.error?.message ||
      `Request failed. HTTP ${err.status}`;
  }

  getBadgeClass(result: string): string {
    switch (result) {
      case 'Matched':
        return 'bg-success';
      case 'AmountMismatch':
      case 'StatusMismatch':
      case 'DuplicateReference':
        return 'bg-danger';
      case 'Pending':
        return 'bg-warning text-dark';
      case 'GatewayNotFound':
      case 'InvalidReference':
        return 'bg-secondary';
      default:
        return 'bg-info text-dark';
    }
  }

  getResultLabel(result: string): string {
    const labels: Record<string, string> = {
      Matched: 'Matched',
      AmountMismatch: 'Amount Mismatch',
      StatusMismatch: 'Status Mismatch',
      DuplicateReference: 'Duplicate Reference',
      Pending: 'Pending',
      GatewayNotFound: 'Gateway Not Found',
      InvalidReference: 'Invalid Reference'
    };

    return labels[result] || result;
  }
}
