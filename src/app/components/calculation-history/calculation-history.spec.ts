import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculationHistory } from './calculation-history';

describe('CalculationHistory', () => {
  let component: CalculationHistory;
  let fixture: ComponentFixture<CalculationHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculationHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculationHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
