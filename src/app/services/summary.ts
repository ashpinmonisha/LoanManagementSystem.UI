import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoanRequest } from '../models/loan-request';
import { FinancialSummaryResponse } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class Summary {
  private readonly http = inject(HttpClient);

  get(body: LoanRequest) {
    return this.http.post<FinancialSummaryResponse>('/api/emi/summary', body);
  }
}