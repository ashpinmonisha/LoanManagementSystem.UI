import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RazorpayCheckout } from './razorpay-checkout';

describe('RazorpayCheckout', () => {
  let component: RazorpayCheckout;
  let fixture: ComponentFixture<RazorpayCheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RazorpayCheckout],
    }).compileComponents();

    fixture = TestBed.createComponent(RazorpayCheckout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
