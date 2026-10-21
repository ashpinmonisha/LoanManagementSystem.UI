import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoanRequest } from '../models/loan-request';
import { RepaymentScheduleResponse } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class Schedule {
  private readonly http = inject(HttpClient);

  generate(body: LoanRequest) {
    return this.http.post<RepaymentScheduleResponse>('/api/emi/schedule', body);
  }
}