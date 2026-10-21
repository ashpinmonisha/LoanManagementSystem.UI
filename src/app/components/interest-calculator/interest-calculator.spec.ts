import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterestCalculator } from './interest-calculator';

describe('InterestCalculator', () => {
  let component: InterestCalculator;
  let fixture: ComponentFixture<InterestCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(InterestCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
