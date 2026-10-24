import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentRefund } from './payment-refund';

describe('PaymentRefund', () => {
  let component: PaymentRefund;
  let fixture: ComponentFixture<PaymentRefund>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentRefund],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentRefund);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
