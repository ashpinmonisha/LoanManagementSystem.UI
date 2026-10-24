import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  PaymentReportsService,
  PaymentDashboard,
  DailyCollection,
  MonthlyCollection,
  LoanPaymentReport,
  CustomerPaymentReport,
  RefundReport,
  ReportFilter
} from '../../../core/services/payment-reports';

@Component({
  selector: 'app-payment-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-reports.html',
  styleUrl: './payment-reports.css'
})
export class PaymentReportsComponent implements OnInit {

  private reportsService = inject(PaymentReportsService);

  filter: ReportFilter = {
    fromDate: '',
    toDate: ''
  };

  dashboard: PaymentDashboard | null = null;
  daily: DailyCollection[] = [];
  monthly: MonthlyCollection[] = [];
  refunds: RefundReport | null = null;

  loanId: number | null = null;
  customerId: number | null = null;

  loanReport: LoanPaymentReport | null = null;
  customerReport: CustomerPaymentReport | null = null;

  activeTab: 'daily' | 'monthly' | 'loan' | 'customer' | 'refunds'
    = 'daily';

  loading = false;
  exporting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    if (
      this.filter.fromDate &&
      this.filter.toDate &&
      this.filter.fromDate > this.filter.toDate
    ) {
      this.errorMessage =
        'From Date cannot be later than To Date.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      dashboard: this.reportsService.getDashboard(this.filter),
      daily: this.reportsService.getDaily(this.filter),
      monthly: this.reportsService.getMonthly(this.filter),
      refunds: this.reportsService.getRefunds(this.filter)
    }).subscribe({
      next: data => {
        this.dashboard = data.dashboard;
        this.daily = data.daily;
        this.monthly = data.monthly;
        this.refunds = data.refunds;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = this.getError(err);
        this.loading = false;
      }
    });
  }

  loadLoanReport(): void {
    if (!this.loanId || this.loanId <= 0) {
      this.errorMessage = 'Enter a valid Loan ID.';
      return;
    }

    this.errorMessage = '';

    this.reportsService.getLoanReport(
      this.loanId,
      this.filter
    ).subscribe({
      next: data => this.loanReport = data,
      error: err => this.errorMessage = this.getError(err)
    });
  }

  loadCustomerReport(): void {
    if (!this.customerId || this.customerId <= 0) {
      this.errorMessage = 'Enter a valid Customer ID.';
      return;
    }

    this.errorMessage = '';

    this.reportsService.getCustomerReport(
      this.customerId,
      this.filter
    ).subscribe({
      next: data => this.customerReport = data,
      error: err => this.errorMessage = this.getError(err)
    });
  }

  exportReport(type: 'excel' | 'pdf'): void {
    if (this.exporting) return;

    this.exporting = true;
    this.errorMessage = '';

    const request = type === 'excel'
      ? this.reportsService.downloadExcel(this.filter)
      : this.reportsService.downloadPdf(this.filter);

    request.subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = type === 'excel'
          ? 'PaymentReport.xlsx'
          : 'PaymentReport.pdf';

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: err => {
        this.errorMessage = this.getError(err);
        this.exporting = false;
      }
    });
  }

  monthName(month: number): string {
    return new Date(2026, month - 1, 1)
      .toLocaleString('en-IN', { month: 'short' });
  }

  getError(err: any): string {
    if (err.status === 0) {
      return 'Cannot connect to backend API. Check HTTPS, port and CORS.';
    }

    if (err.status === 401) {
      return 'Unauthorized. Login again with a valid JWT token.';
    }

    if (err.status === 403) {
      return 'Access denied. Admin or Manager role is required.';
    }

    return err.error?.message ||
      `Request failed. HTTP ${err.status}`;
  }
}
