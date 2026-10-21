import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedPayment } from './advanced-payment';

describe('AdvancedPayment', () => {
  let component: AdvancedPayment;
  let fixture: ComponentFixture<AdvancedPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedPayment],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
