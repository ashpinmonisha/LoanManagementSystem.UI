import { API_BASE_URL } from '../../core/api-url';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanApplication } from '../../core/models/loan.model';

export interface LoanDecisionRequest {
  approved: boolean;
  remarks: string;
}

export interface LoanDecisionResponse {
  message: string;
  loanId: number;
  status: string;
  remarks: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoanApprovalService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = API_BASE_URL + '/Loan';

  getLoan(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.apiUrl}/${id}`);
  }

  makeDecision(
    id: number,
    request: LoanDecisionRequest
  ): Observable<LoanDecisionResponse> {
    return this.http.put<LoanDecisionResponse>(
      `${this.apiUrl}/${id}/decision`,
      request
    );
  }
}