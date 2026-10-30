import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CustomerManagementService } from './customer-management';

describe('CustomerManagementService', () => {
  let service: CustomerManagementService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomerManagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploads KYC documents as multipart form data', () => {
    const file = new File(['identity'], 'identity.pdf', { type: 'application/pdf' });
    service.uploadKycDocument('Passport', 'P12345', file, '2030-01-01').subscribe();

    const request = http.expectOne('/api/KycDocument/upload');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get('documentType')).toBe('Passport');
    expect(request.request.body.get('documentNumber')).toBe('P12345');
    expect(request.request.body.get('file')).toBe(file);
    expect(request.request.body.get('expiryDate')).toBe('2030-01-01');
    request.flush({ message: 'KYC document submitted successfully.' });
  });

  it('saves and checks eligibility for the signed-in customer', () => {
    const profile = {
      customerId: 12,
      monthlyIncome: 50000,
      employmentType: 'Salaried',
      employmentStatus: 'Employed',
      employerName: 'Example',
      employmentExperienceYears: 5,
      creditScore: 750,
      existingLoanCount: 1,
      existingMonthlyObligations: 5000,
      existingLoanAmount: 100000,
      financialProfileRemarks: '',
    };
    service.saveEligibility(profile).subscribe();
    const save = http.expectOne('/api/CustomerEligibility/save');
    expect(save.request.body).toEqual(profile);
    save.flush(profile);

    service.checkEligibility(12).subscribe((result) => expect(result.eligible).toBe(true));
    const check = http.expectOne('/api/CustomerEligibility/12/check');
    expect(check.request.method).toBe('GET');
    check.flush({
      customerId: 12,
      eligible: true,
      monthlyIncome: 50000,
      creditScore: 750,
      disposableIncome: 45000,
      message: 'Eligible',
    });
  });
});
