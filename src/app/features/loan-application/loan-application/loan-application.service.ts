import { API_BASE_URL } from '../../../core/api-url';

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanApplication, LoanApplicationRequest, LoanApplicationResponse } from '../../../core/models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanApplicationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL + '/Loan';

  getApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(
      `${this.apiUrl}/applications`
    );
  }

  getApplication(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(
      `${this.apiUrl}/${id}`
    );
  }

  createApplication(
    request: LoanApplicationRequest
  ): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(
      `${this.apiUrl}/apply`,
      request
    );
  }
}
