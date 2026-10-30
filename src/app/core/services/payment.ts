import { API_BASE_URL } from '../api-url';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';

export interface RecordPayment {
  customerId: number;
  loanId: number;
  emiId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: string;
}

export interface PaymentHistory {
  paymentId: number;
  customerId: number;
  loanId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: string;
}

export interface OutstandingBalance {
  loanId: number;
  remainingPrincipal: number;
  remainingInterest: number;
  pendingEmiAmount: number;
  overdueAmount: number;
  penaltyAmount: number;
  totalOutstanding: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);

  private apiUrl = API_BASE_URL;

  // 4.1 Record Payment
  recordPayment(data: RecordPayment): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/Payments`,
      data
    );
  }

  // 4.2 Payment History
  getHistory(loanId: number, customerPortal = false): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(
      `${this.apiUrl}/Payments/history/${loanId}`,
      customerPortal ? { context: new HttpContext().set(CUSTOMER_PORTAL_REQUEST, true) } : {},
    );
  }

  // 4.3 Outstanding Balance
  getOutstanding(loanId: number, customerPortal = false): Observable<OutstandingBalance> {
    return this.http.get<OutstandingBalance>(
      `${this.apiUrl}/Payments/outstanding/${loanId}`,
      customerPortal ? { context: new HttpContext().set(CUSTOMER_PORTAL_REQUEST, true) } : {},
    );
  }

  // 4.4 Advanced - penalty
  createPenalty(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/AdvancedPayments/penalty`,
      data
    );
  }

  // 4.4 Advanced - loan closure
  closeLoan(loanId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/AdvancedPayments/close/${loanId}`,
      {}
    );
  }
}