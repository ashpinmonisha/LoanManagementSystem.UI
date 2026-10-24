import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { PaymentReceiptService } from './payment-receipt.service';

describe('PaymentReceiptService', () => {
  let service: PaymentReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(PaymentReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
