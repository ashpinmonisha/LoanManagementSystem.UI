import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentDashboard {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  grossCollections: number;
  completedRefunds: number;
  netCollections: number;
}

export interface DailyCollection {
  date: string;
  paymentCount: number;
  totalAmount: number;
}

export interface MonthlyCollection {
  year: number;
  month: number;
  paymentCount: number;
  totalAmount: number;
}

export interface LoanPaymentReport {
  loanId: number;
  paymentCount: number;
  totalPaid: number;
}

export interface CustomerPaymentReport {
  customerId: number;
  paymentCount: number;
  totalPaid: number;
}

export interface RefundReport {
  totalRefunds: number;
  pendingRefunds: number;
  completedRefunds: number;
  failedRefunds: number;
  completedRefundAmount: number;
}

export interface ReportFilter {
  fromDate?: string;
  toDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentReportsService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    'https://localhost:7085/api/PaymentReports';

  private params(filter: ReportFilter): HttpParams {
    let params = new HttpParams();

    if (filter.fromDate) {
      params = params.set('FromDate', filter.fromDate);
    }

    if (filter.toDate) {
      params = params.set('ToDate', filter.toDate);
    }

    return params;
  }

  getDashboard(filter: ReportFilter):
    Observable<PaymentDashboard> {
    return this.http.get<PaymentDashboard>(
      `${this.apiUrl}/dashboard`,
      { params: this.params(filter) }
    );
  }

  getDaily(filter: ReportFilter):
    Observable<DailyCollection[]> {
    return this.http.get<DailyCollection[]>(
      `${this.apiUrl}/daily`,
      { params: this.params(filter) }
    );
  }

  getMonthly(filter: ReportFilter):
    Observable<MonthlyCollection[]> {
    return this.http.get<MonthlyCollection[]>(
      `${this.apiUrl}/monthly`,
      { params: this.params(filter) }
    );
  }

  getLoanReport(
    loanId: number,
    filter: ReportFilter
  ): Observable<LoanPaymentReport> {
    return this.http.get<LoanPaymentReport>(
      `${this.apiUrl}/loan/${loanId}`,
      { params: this.params(filter) }
    );
  }

  getCustomerReport(
    customerId: number,
    filter: ReportFilter
  ): Observable<CustomerPaymentReport> {
    return this.http.get<CustomerPaymentReport>(
      `${this.apiUrl}/customer/${customerId}`,
      { params: this.params(filter) }
    );
  }

  getRefunds(filter: ReportFilter):
    Observable<RefundReport> {
    return this.http.get<RefundReport>(
      `${this.apiUrl}/refunds`,
      { params: this.params(filter) }
    );
  }

  downloadExcel(filter: ReportFilter): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export/excel`,
      {
        params: this.params(filter),
        responseType: 'blob'
      }
    );
  }

  downloadPdf(filter: ReportFilter): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export/pdf`,
      {
        params: this.params(filter),
        responseType: 'blob'
      }
    );
  }
}