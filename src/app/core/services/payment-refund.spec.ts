import { TestBed } from '@angular/core/testing';
import { PaymentRefund } from './payment-refund';

describe('PaymentRefund', () => {
  let service: PaymentRefund;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentRefund);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
