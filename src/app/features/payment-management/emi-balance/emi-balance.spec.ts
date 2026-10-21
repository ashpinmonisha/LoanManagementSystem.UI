import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmiBalance } from './emi-balance';

describe('EmiBalance', () => {
  let component: EmiBalance;
  let fixture: ComponentFixture<EmiBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmiBalance],
    }).compileComponents();

    fixture = TestBed.createComponent(EmiBalance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
