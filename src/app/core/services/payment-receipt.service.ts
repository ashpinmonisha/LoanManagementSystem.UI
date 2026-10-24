import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentReceipt {
  id: number;
  receiptNumber: string;
  paymentId: number;
  customerId: number;
  loanId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: string;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentReceiptService {
  private http = inject(HttpClient);

  private apiUrl =
    'https://localhost:7085/api/PaymentReceipts';

  generate(paymentId: number): Observable<PaymentReceipt> {
    return this.http.post<PaymentReceipt>(
      `${this.apiUrl}/generate/${paymentId}`,
      {}
    );
  }

  get(paymentId: number): Observable<PaymentReceipt> {
    return this.http.get<PaymentReceipt>(
      `${this.apiUrl}/${paymentId}`
    );
  }

  getByLoan(loanId: number): Observable<PaymentReceipt[]> {
    return this.http.get<PaymentReceipt[]>(
      `${this.apiUrl}/loan/${loanId}`
    );
  }

  download(paymentId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/download/${paymentId}`,
      { responseType: 'blob' }
    );
  }
}