import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { PaymentService } from './payment';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(PaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
