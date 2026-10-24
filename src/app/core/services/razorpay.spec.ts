import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { RazorpayService } from './razorpay';

describe('RazorpayService', () => {
  let service: RazorpayService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(RazorpayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
