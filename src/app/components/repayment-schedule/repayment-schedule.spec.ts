import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepaymentSchedule } from './repayment-schedule';

describe('RepaymentSchedule', () => {
  let component: RepaymentSchedule;
  let fixture: ComponentFixture<RepaymentSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepaymentSchedule],
    }).compileComponents();

    fixture = TestBed.createComponent(RepaymentSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
