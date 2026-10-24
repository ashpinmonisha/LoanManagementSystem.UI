import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { EmiAllocationService } from './emi-allocation';

describe('EmiAllocationService', () => {
  let service: EmiAllocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(EmiAllocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
