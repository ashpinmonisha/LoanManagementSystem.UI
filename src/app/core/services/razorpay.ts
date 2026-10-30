import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';
import { API_BASE_URL } from '../api-url';

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

  private readonly api = `${API_BASE_URL}/Razorpay`;

  createOrder(data: CreateOrderRequest, customerPortal = false) {
    return this.http.post<RazorpayOrder>(
      `${this.api}/create-order`,
      data,
      customerPortal ? { context: new HttpContext().set(CUSTOMER_PORTAL_REQUEST, true) } : {},
    );
  }

  verifyPayment(data: VerifyPaymentRequest, customerPortal = false) {
    return this.http.post<VerifyPaymentResponse>(
      `${this.api}/verify`,
      data,
      customerPortal ? { context: new HttpContext().set(CUSTOMER_PORTAL_REQUEST, true) } : {},
    );
  }

  getConfirmation(orderId: string) {
    return this.http.get<PaymentConfirmation>(
      `${this.api}/confirmation/${encodeURIComponent(orderId)}`
    );
  }
}