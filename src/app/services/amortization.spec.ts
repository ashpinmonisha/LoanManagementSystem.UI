import { TestBed } from '@angular/core/testing';
import { Amortization } from './amortization';

describe('Amortization', () => {
  let service: Amortization;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Amortization);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
