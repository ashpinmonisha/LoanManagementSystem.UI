import { TestBed } from '@angular/core/testing';
import { Comparison } from './comparison';

describe('Comparison', () => {
  let service: Comparison;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Comparison);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
