import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateRefundDto {
  paymentId: number;
  amount: number;
  reason: string;
}

export interface RefundResponseDto {
  refundId: number;
  paymentId: number;
  customerId: number;
  loanId: number;
  amount: number;
  reason: string;
  status: string;
  razorpayRefundId: string | null;
  failureReason: string | null;
  requestedAt: string;
  completedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentRefundService {
  private http = inject(HttpClient);

  private apiUrl =
    'https://localhost:7085/api/PaymentRefunds';

  requestRefund(dto: CreateRefundDto):
    Observable<RefundResponseDto> {
    return this.http.post<RefundResponseDto>(
      `${this.apiUrl}/request`, dto);
  }

  approveRefund(id: number):
    Observable<RefundResponseDto> {
    return this.http.put<RefundResponseDto>(
      `${this.apiUrl}/approve/${id}`, {});
  }

  rejectRefund(id: number, reason: string):
    Observable<RefundResponseDto> {
    return this.http.put<RefundResponseDto>(
      `${this.apiUrl}/reject/${id}`, { reason });
  }

  processRefund(id: number):
    Observable<RefundResponseDto> {
    return this.http.post<RefundResponseDto>(
      `${this.apiUrl}/process/${id}`, {});
  }

  checkStatus(id: number):
    Observable<RefundResponseDto> {
    return this.http.get<RefundResponseDto>(
      `${this.apiUrl}/status/${id}`);
  }

  getHistory(paymentId: number):
    Observable<RefundResponseDto[]> {
    return this.http.get<RefundResponseDto[]>(
      `${this.apiUrl}/history/${paymentId}`);
  }
}