import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoanRequest } from '../models/loan-request';
import { EmiResponse } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class Emi {
  private readonly http = inject(HttpClient);

  calculate(body: LoanRequest) {
    return this.http.post<EmiResponse>('/api/emi/calculate', body);
  }
}