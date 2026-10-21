import { TestBed } from '@angular/core/testing';
import { Prepayment } from './prepayment';

describe('Prepayment', () => {
  let service: Prepayment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Prepayment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
