import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoanRequest } from '../models/loan-request';
import { AmortizationResponse } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class Amortization {
  private readonly http = inject(HttpClient);

  analyze(body: LoanRequest) {
    return this.http.post<AmortizationResponse>('/api/emi/amortization', body);
  }
}