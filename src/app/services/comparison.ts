import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CompareOption } from '../models/loan-request';
import { LoanComparisonResponse } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class Comparison {
  private readonly http = inject(HttpClient);

  compare(options: CompareOption[]) {
    return this.http.post<LoanComparisonResponse>('/api/emi/compare', { options });
  }
}