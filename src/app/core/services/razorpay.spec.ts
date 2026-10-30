import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';
import { RazorpayService } from './razorpay';

describe('RazorpayService', () => {
  let service: RazorpayService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RazorpayService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates a Razorpay order for a customer payment', () => {
    const payment = { customerId: 9, loanId: 42, emiId: 5, amount: 600 };
    service.createOrder(payment, true).subscribe();

    const request = http.expectOne('/api/Razorpay/create-order');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payment);
    expect(request.request.context.get(CUSTOMER_PORTAL_REQUEST)).toBe(true);
    request.flush({ keyId: 'test-key', orderId: 'order-1', amount: 60000, currency: 'INR' });
  });

  it('verifies a Razorpay payment for a customer request', () => {
    const verification = {
      razorpayOrderId: 'order-1',
      razorpayPaymentId: 'payment-1',
      razorpaySignature: 'signature',
    };
    service.verifyPayment(verification, true).subscribe();

    const request = http.expectOne('/api/Razorpay/verify');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(verification);
    expect(request.request.context.get(CUSTOMER_PORTAL_REQUEST)).toBe(true);
    request.flush({
      message: 'Payment verified',
      payment: {
        paymentId: 1,
        customerId: 9,
        loanId: 42,
        emiId: 5,
        amount: 600,
        paymentReference: 'payment-1',
        paymentMethod: 'UPI',
        paymentStatus: 'Completed',
        paymentDate: '2026-10-27T00:00:00Z',
      },
    });
  });
});
