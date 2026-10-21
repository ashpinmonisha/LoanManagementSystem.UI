import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanComparison } from './loan-comparison';

describe('LoanComparison', () => {
  let component: LoanComparison;
  let fixture: ComponentFixture<LoanComparison>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanComparison],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanComparison);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
