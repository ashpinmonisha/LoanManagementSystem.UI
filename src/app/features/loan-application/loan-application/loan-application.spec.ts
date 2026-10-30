import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoanApplicationComponent } from './loan-application';
import { LoanApplicationService } from './loan-application.service';

describe('LoanApplicationComponent', () => {
  let component: LoanApplicationComponent;
  let fixture: ComponentFixture<LoanApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanApplicationComponent],
      providers: [
        provideRouter([]),
        {
          provide: LoanApplicationService,
          useValue: { createApplication: () => of({ loanId: 1, status: 'Pending' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanApplicationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
