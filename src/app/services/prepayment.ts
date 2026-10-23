import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PrepaymentRequest } from '../models/loan-request';
import { PrepaymentResponse } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class Prepayment {
  private readonly http = inject(HttpClient);

  calculate(body: PrepaymentRequest) {
    return this.http.post<PrepaymentResponse>('/api/emi/prepayment', body);
  }
}