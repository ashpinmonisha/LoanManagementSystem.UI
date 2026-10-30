import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';
import { PaymentService } from './payment';

describe('PaymentService', () => {
  let service: PaymentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads payment history through the customer API request context', () => {
    service.getHistory(42, true).subscribe();

    const request = http.expectOne('/api/Payments/history/42');
    expect(request.request.method).toBe('GET');
    expect(request.request.context.get(CUSTOMER_PORTAL_REQUEST)).toBe(true);
    request.flush([]);
  });
});
