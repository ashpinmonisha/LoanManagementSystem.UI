import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrepaymentCalculator } from './prepayment-calculator';

describe('PrepaymentCalculator', () => {
  let component: PrepaymentCalculator;
  let fixture: ComponentFixture<PrepaymentCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrepaymentCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(PrepaymentCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
