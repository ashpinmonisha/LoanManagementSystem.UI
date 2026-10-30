import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  RazorpayService,
  RazorpayOrder,
  PaymentConfirmation,
  VerifyPaymentRequest
} from '../../../core/services/razorpay';

@Component({
  selector: 'app-razorpay-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './razorpay-checkout.html',
  styleUrl: './razorpay-checkout.css'
})
export class RazorpayCheckout implements OnChanges {

  private service = inject(RazorpayService);
  private platformId = inject(PLATFORM_ID);

  @Input() customerId: number | null = null;
  @Input() customerPortal = false;
  @Input() loanId = 0;
  @Input() emiId = 0;
  @Input() amount = 0;
  @Output() paymentVerified = new EventEmitter<void>();

  loading = false;
  error = '';
  message = '';

  confirmation: PaymentConfirmation | null = null;

  payment = {
    customerId: 0,
    loanId: 0,
    emiId: 0,
    amount: 500
  };

  ngOnChanges(): void {
    if (!this.customerPortal) return;
    this.payment = {
      ...this.payment,
      customerId: this.customerId ?? 0,
      loanId: this.loanId,
      emiId: this.emiId,
      amount: this.amount,
    };
  }

  private loadRazorpay(): Promise<void> {

    if (!isPlatformBrowser(this.platformId)) {
      return Promise.reject(
        new Error('Razorpay requires a browser')
      );
    }

    if ((window as any).Razorpay) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {

      const script = document.createElement('script');

      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';

      script.onload = () => resolve();

      script.onerror = () =>
        reject(new Error('Checkout loading failed'));

      document.body.appendChild(script);
    });
  }

  async payNow() {

    this.error = '';
    this.message = '';
    this.confirmation = null;

    if (
      this.payment.customerId <= 0 ||
      this.payment.loanId <= 0 ||
      this.payment.emiId <= 0 ||
      this.payment.amount < 1
    ) {
      this.error = 'Enter valid payment details.';
      return;
    }

    this.loading = true;

    try {
      await this.loadRazorpay();

      this.service.createOrder(this.payment, this.customerPortal)
        .subscribe({
          next: order => {
            this.loading = false;
            this.openCheckout(order);
          },
          error: err => {
            this.loading = false;
            this.error =
              err.error?.message ||
              'Unable to create order.';
          }
        });

    } catch {
      this.loading = false;
      this.error = 'Razorpay could not be loaded.';
    }
  }

  private openCheckout(order: RazorpayOrder) {

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'LoanSphere',
      description: 'Loan EMI Payment',
      order_id: order.orderId,

      theme: {
        color: '#6756ee'
      },

      handler: (response: any) => {

        const request: VerifyPaymentRequest = {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        };

        this.loading = true;
        this.message = 'Verifying payment...';

        this.service.verifyPayment(request, this.customerPortal)
          .subscribe({
            next: result => {
              this.loading = false;
              this.confirmation = result.payment;

              this.message =
                'Payment confirmed and recorded successfully.';
              this.paymentVerified.emit();
            },
            error: () => {
              this.loading = false;
              this.message = '';

              this.error =
                'Payment confirmation is pending. ' +
                'Check the order status before paying again.';
            }
          });
      },

      modal: {
        ondismiss: () => {
          if (!this.confirmation) {
            this.message =
              'Checkout closed. Verify payment status before retrying.';
          }
        }
      }
    };

    const RazorpayConstructor = (window as any).Razorpay;
    const checkout = new RazorpayConstructor(options);

    checkout.on('payment.failed', () => {
      this.error =
        'Payment attempt failed. No payment has been confirmed.';
    });

    checkout.open();
  }
}