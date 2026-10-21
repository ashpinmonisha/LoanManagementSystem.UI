import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmortizationAnalysis } from './amortization-analysis';

describe('AmortizationAnalysis', () => {
  let component: AmortizationAnalysis;
  let fixture: ComponentFixture<AmortizationAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmortizationAnalysis],
    }).compileComponents();

    fixture = TestBed.createComponent(AmortizationAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
