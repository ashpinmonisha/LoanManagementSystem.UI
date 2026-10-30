import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';
import { EmiAllocationService } from './emi-allocation';

describe('EmiAllocationService', () => {
  let service: EmiAllocationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmiAllocationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads outstanding EMIs through the customer API request context', () => {
    service.getOutstanding(42, true).subscribe();

    const request = http.expectOne('/api/EmiAllocations/outstanding/42');
    expect(request.request.method).toBe('GET');
    expect(request.request.context.get(CUSTOMER_PORTAL_REQUEST)).toBe(true);
    request.flush({
      loanId: 42,
      totalEmiAmount: 1000,
      totalPaid: 400,
      totalOutstanding: 600,
      overdueAmount: 0,
      emis: [],
    });
  });
});
