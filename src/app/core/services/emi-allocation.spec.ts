import { TestBed } from '@angular/core/testing';
import { EmiAllocation } from './emi-allocation';

describe('EmiAllocation', () => {
  let service: EmiAllocation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmiAllocation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
