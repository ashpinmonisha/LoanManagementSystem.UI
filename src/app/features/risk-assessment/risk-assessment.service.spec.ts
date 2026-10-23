import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  RiskAssessmentRequest,
  RiskAssessmentResponse
} from '../../core/models/loan.model';
import { RiskAssessmentService } from './risk-assessment.service';

describe('RiskAssessmentService', () => {
  let service: RiskAssessmentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RiskAssessmentService
      ]
    });

    service = TestBed.inject(RiskAssessmentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('posts the profile to the loan risk-assessment endpoint', () => {
    const request: RiskAssessmentRequest = {
      monthlyIncome: 50000,
      employmentExperience: 5,
      existingLoanAmount: 10000
    };
    const response: RiskAssessmentResponse = {
      message: 'Assessment completed',
      loanId: 1005,
      riskScore: 42,
      riskLevel: 'Medium',
      recommendation: 'Review affordability'
    };

    service.assessRisk(1005, request).subscribe(result => {
      expect(result).toEqual(response);
    });

    const httpRequest = httpTestingController.expectOne(
      'https://localhost:7085/api/Loan/1005/risk-assessment'
    );
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush(response);
  });
});
