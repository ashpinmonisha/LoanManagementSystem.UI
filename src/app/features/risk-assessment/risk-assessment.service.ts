import { API_BASE_URL } from '../../core/api-url';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RiskAssessmentRequest, RiskAssessmentResponse } from '../../core/models/loan.model';

@Injectable({
  providedIn: 'root',
})
export class RiskAssessmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL + '/Loan';

  assessRisk(loanId: number, request: RiskAssessmentRequest): Observable<RiskAssessmentResponse> {
    return this.http.post<RiskAssessmentResponse>(
      `${this.apiUrl}/${loanId}/risk-assessment`,
      request,
    );
  }
}
