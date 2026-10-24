import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoanApprovalComponent } from './loan-approval';
import { LoanApprovalService } from './loan-approval.service';

describe('LoanApprovalComponent', () => {
  let component: LoanApprovalComponent;
  let fixture: ComponentFixture<LoanApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanApprovalComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
        {
          provide: LoanApprovalService,
          useValue: {
            getLoan: () =>
              of({
                loanApplicationId: 1,
                customerId: 1,
                loanType: 'Personal',
                loanAmount: 10000,
                loanTenure: 12,
                loanPurpose: 'Testing',
                applicationDate: '',
                status: 'Pending',
                remarks: null,
                reviewedByEmployeeId: null,
                reviewedDate: null,
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanApprovalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
