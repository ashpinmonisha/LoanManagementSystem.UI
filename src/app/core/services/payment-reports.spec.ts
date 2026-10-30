import { TestBed } from '@angular/core/testing';
import { PaymentReports } from './payment-reports';

describe('PaymentReports', () => {
  let service: PaymentReports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentReports);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
