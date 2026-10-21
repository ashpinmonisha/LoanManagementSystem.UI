import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { RiskAssessmentComponent } from './risk-assessment';

describe('RiskAssessmentComponent', () => {
  let component: RiskAssessmentComponent;
  let fixture: ComponentFixture<RiskAssessmentComponent>;
  let http: HttpTestingController;
  const endpoint = '/api/Loan/42/risk-assessment';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskAssessmentComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '42' }) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RiskAssessmentComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    component.monthlyIncome = 50000;
    component.employmentExperience = 5;
    component.existingLoanAmount = 10000;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('posts to the loan endpoint and renders the asynchronous result', async () => {
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const request = http.expectOne(endpoint);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      monthlyIncome: 50000,
      employmentExperience: 5,
      existingLoanAmount: 10000,
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Calculating...');
    request.flush({
      message: 'Assessed',
      loanId: 42,
      riskScore: 25,
      riskLevel: 'Low',
      recommendation: 'Eligible for review',
    });
    await fixture.whenStable();
    expect(component.loading).toBe(false);
    expect(fixture.nativeElement.querySelector('.level').textContent).toContain('Low');
    expect(fixture.nativeElement.textContent).toContain('Eligible for review');
    expect(fixture.nativeElement.textContent).not.toContain('Calculating...');
  });

  it('renders API errors and clears loading', async () => {
    component.assess();
    http
      .expectOne(endpoint)
      .flush({ message: 'Loan application not found.' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(component.loading).toBe(false);
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain(
      'Loan application not found.',
    );
  });

  it('prevents duplicate requests', () => {
    component.assess();
    component.assess();
    http.expectOne(endpoint).flush({ riskScore: 25, riskLevel: 'Low' });
  });

  it('rejects invalid IDs and values without sending requests', () => {
    component.loanId = 0;
    component.assess();
    expect(component.errorMessage).toBe('Invalid loan application ID.');
    component.loanId = 42;
    component.monthlyIncome = 0;
    component.assess();
    expect(component.errorMessage).toBe('Please enter valid assessment values.');
    http.expectNone(endpoint);
  });
});
