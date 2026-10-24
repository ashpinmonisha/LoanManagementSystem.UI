import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-url';
import {
  CustomerEligibilityProfile,
  CustomerEligibilityResult,
  CustomerProfile,
  CustomerProfileUpdateRequest,
  KycDocument,
  KycUploadResponse,
} from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL;

  getProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.apiUrl}/Customer/profile`);
  }

  updateProfile(request: CustomerProfileUpdateRequest): Observable<Partial<CustomerProfile>> {
    return this.http.put<Partial<CustomerProfile>>(`${this.apiUrl}/Customer/profile`, request);
  }

  getKycDocuments(): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.apiUrl}/KycDocument/my-documents`);
  }

  uploadKycDocument(
    documentType: string,
    documentNumber: string,
    file: File,
    expiryDate: string | null,
  ): Observable<KycUploadResponse> {
    const body = new FormData();
    body.set('documentType', documentType);
    body.set('documentNumber', documentNumber);
    body.set('file', file);
    if (expiryDate) body.set('expiryDate', expiryDate);
    return this.http.post<KycUploadResponse>(`${this.apiUrl}/KycDocument/upload`, body);
  }

  getEligibility(customerId: number): Observable<CustomerEligibilityProfile> {
    return this.http.get<CustomerEligibilityProfile>(
      `${this.apiUrl}/CustomerEligibility/${customerId}`,
    );
  }

  saveEligibility(
    profile: CustomerEligibilityProfile,
  ): Observable<Partial<CustomerEligibilityProfile>> {
    return this.http.post<Partial<CustomerEligibilityProfile>>(
      `${this.apiUrl}/CustomerEligibility/save`,
      profile,
    );
  }

  checkEligibility(customerId: number): Observable<CustomerEligibilityResult> {
    return this.http.get<CustomerEligibilityResult>(
      `${this.apiUrl}/CustomerEligibility/${customerId}/check`,
    );
  }
}
