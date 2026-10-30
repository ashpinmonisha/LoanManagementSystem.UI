import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-url';

export interface ReconciliationResponseDto {
  reconciliationId: number;
  paymentId: number;
  loanId: number;
  paymentReference: string;
  databaseAmount: number;
  gatewayAmount: number | null;
  databaseStatus: string;
  gatewayStatus: string | null;
  result: string;
  remarks: string;
  reconciledAt: string;
}

export interface ReconciliationReportDto {
  totalPaymentsChecked: number;
  matched: number;
  amountMismatches: number;
  statusMismatches: number;
  duplicateReferences: number;
  pending: number;
  gatewayNotFound: number;
  invalidReferences: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentReconciliationService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${API_BASE_URL}/PaymentReconciliation`;

  verifyPayment(
    paymentId: number
  ): Observable<ReconciliationResponseDto> {
    return this.http.post<ReconciliationResponseDto>(
      `${this.apiUrl}/verify/${paymentId}`,
      null
    );
  }

  bulkReconcile(
    limit: number
  ): Observable<ReconciliationResponseDto[]> {
    const params = new HttpParams()
      .set('limit', limit.toString());

    return this.http.post<ReconciliationResponseDto[]>(
      `${this.apiUrl}/bulk`,
      null,
      { params }
    );
  }

  getHistory(
    paymentId: number
  ): Observable<ReconciliationResponseDto[]> {
    return this.http.get<ReconciliationResponseDto[]>(
      `${this.apiUrl}/history/${paymentId}`
    );
  }

  getMismatches():
    Observable<ReconciliationResponseDto[]> {
    return this.http.get<ReconciliationResponseDto[]>(
      `${this.apiUrl}/mismatches`
    );
  }

  getReport(): Observable<ReconciliationReportDto> {
    return this.http.get<ReconciliationReportDto>(
      `${this.apiUrl}/report`
    );
  }
}