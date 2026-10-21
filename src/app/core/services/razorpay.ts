import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CreateOrderRequest {
  customerId: number;
  loanId: number;
  emiId: number;
  amount: number;
}

export interface RazorpayOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentConfirmation {
  paymentId: number;
  customerId: number;
  loanId: number;
  emiId: number;
  amount: number;
  paymentReference: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
}

export interface VerifyPaymentResponse {
  message: string;
  payment: PaymentConfirmation;
}

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  private http = inject(HttpClient);

  private api = 'https://localhost:7085/api/Razorpay';

  createOrder(data: CreateOrderRequest) {
    return this.http.post<RazorpayOrder>(
      `${this.api}/create-order`,
      data
    );
  }

  verifyPayment(data: VerifyPaymentRequest) {
    return this.http.post<VerifyPaymentResponse>(
      `${this.api}/verify`,
      data
    );
  }

  getConfirmation(orderId: string) {
    return this.http.get<PaymentConfirmation>(
      `${this.api}/confirmation/${encodeURIComponent(orderId)}`
    );
  }
}