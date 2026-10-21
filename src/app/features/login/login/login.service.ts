import { API_BASE_URL } from '../../../core/api-url';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  EmployeeLoginRequest,
  EmployeeLoginResponse
} from '../../../core/models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly apiUrl = API_BASE_URL + '/Employee';
  private readonly storageKey = 'employee';

  // sessionStorage does not exist on the server when SSR is on
  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage : null;
  }

  login(
    credentials: EmployeeLoginRequest
  ): Observable<EmployeeLoginResponse> {
    return this.http
      .post<EmployeeLoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storage?.setItem(
            this.storageKey,
            JSON.stringify(response.employee)
          );
        })
      );
  }

  getEmployee(): EmployeeLoginResponse['employee'] | null {
    const value = this.storage?.getItem(this.storageKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.getEmployee()?.token ?? null;
  }

  logout(): void {
    this.storage?.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return !payload.exp || payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isEmployee(): boolean {
    return this.getEmployee()?.role?.toLowerCase() === 'employee';
  }
}