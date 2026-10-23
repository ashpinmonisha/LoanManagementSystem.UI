import { TestBed } from '@angular/core/testing';
import { Interest } from './interest';

describe('Interest', () => {
  let service: Interest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Interest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
