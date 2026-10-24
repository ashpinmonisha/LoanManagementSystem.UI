import { TestBed } from '@angular/core/testing';
import { PaymentReconciliation } from './payment-reconciliation';

describe('PaymentReconciliation', () => {
  let service: PaymentReconciliation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentReconciliation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
