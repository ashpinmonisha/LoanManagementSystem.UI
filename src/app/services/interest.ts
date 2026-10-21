import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoanRequest } from '../models/loan-request';
import { InterestResponse } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class Interest {
  private readonly http = inject(HttpClient);

  calculate(body: LoanRequest) {
    return this.http.post<InterestResponse>('/api/emi/interest', body);
  }
}