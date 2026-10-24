import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api-url';
import {
  CustomerLoginRequest,
  CustomerRegistrationRequest,
  CustomerRegistrationResponse,
  CustomerSession,
} from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${API_BASE_URL}/Customer`;
  private readonly storageKey = 'customer';

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage : null;
  }

  register(request: CustomerRegistrationRequest): Observable<CustomerRegistrationResponse> {
    return this.http.post<CustomerRegistrationResponse>(`${this.apiUrl}/register`, request);
  }

  login(request: CustomerLoginRequest): Observable<CustomerSession> {
    return this.http
      .post<CustomerSession>(`${this.apiUrl}/login`, request)
      .pipe(tap((customer) => this.storage?.setItem(this.storageKey, JSON.stringify(customer))));
  }

  getCustomer(): CustomerSession | null {
    const value = this.storage?.getItem(this.storageKey);
    if (!value) return null;

    try {
      return JSON.parse(value) as CustomerSession;
    } catch {
      this.logout();
      return null;
    }
  }

  getToken(): string | null {
    return this.getCustomer()?.token ?? null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
      if (!payload) return false;
      const expiration = JSON.parse(atob(payload)).exp as number | undefined;
      return expiration === undefined || expiration * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  logout(): void {
    this.storage?.removeItem(this.storageKey);
  }
}
