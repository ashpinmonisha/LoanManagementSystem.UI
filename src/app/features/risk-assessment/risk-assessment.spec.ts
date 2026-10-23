import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject, TimeoutError } from 'rxjs';
import { RiskAssessmentRequest, RiskAssessmentResponse } from '../../core/models/loan.model';
import { RiskAssessmentService } from './risk-assessment.service';
import { RiskAssessmentComponent } from './risk-assessment';

describe('RiskAssessmentComponent', () => {
  let component: RiskAssessmentComponent;
  let fixture: ComponentFixture<RiskAssessmentComponent>;
  let submittedLoanId: number | null;
  let submittedProfile: RiskAssessmentRequest | null;

  const response: RiskAssessmentResponse = {
    message: 'Assessment completed',
    loanId: 1005,
    riskScore: 42,
    riskLevel: 'Medium',
    recommendation: 'Review affordability'
  };

  beforeEach(async () => {
    submittedLoanId = null;
    submittedProfile = null;

    await TestBed.configureTestingModule({
      imports: [RiskAssessmentComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1005' } } }
        },
        {
          provide: RiskAssessmentService,
          useValue: {
            assessRisk: (loanId: number, profile: RiskAssessmentRequest) => {
              submittedLoanId = loanId;
              submittedProfile = profile;
              return of(response);
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RiskAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows submission attempts and shows validation feedback for an incomplete profile', () => {
    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(false);
    button.click();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Please enter valid assessment values.');
    expect(submittedLoanId).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('Please enter valid assessment values.');
  });

  it('submits the financial profile and displays the backend assessment', () => {
    component.monthlyIncome = 50000;
    component.employmentExperience = 5;
    component.existingLoanAmount = 10000;

    component.assess();

    expect(submittedLoanId).toBe(1005);
    expect(submittedProfile).toEqual({
      monthlyIncome: 50000,
      employmentExperience: 5,
      existingLoanAmount: 10000
    });
    expect(component.result).toEqual(response);
    expect(component.loading).toBe(false);
  });

  it('keeps the button disabled while submitting and unlocks it on timeout', () => {
    const pendingAssessment = new Subject<RiskAssessmentResponse>();
    const service = TestBed.inject(RiskAssessmentService);
    vi.spyOn(service, 'assessRisk').mockReturnValue(pendingAssessment);
    component.monthlyIncome = 50000;
    component.employmentExperience = 5;
    component.existingLoanAmount = 10000;

    component.assess();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Calculating...');

    pendingAssessment.error(new TimeoutError());
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.validLoanId).toBe(true);
    expect(
      (fixture.nativeElement.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement).disabled
    ).toBe(false);
    expect(component.errorMessage).toContain('timed out');
  });
});
