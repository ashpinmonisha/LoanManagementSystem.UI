
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface EmployeeLoginRequest {
  employeeId: number;
  password: string;
}

export interface EmployeeLoginResponse {
  token: string;
  employeeId?: number;
  employeeName?: string;
  role?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly http = inject(HttpClient);

  // Change this to the HTTPS URL of your running backend.
  private readonly apiUrl = 'https://localhost:7085/api/Employee';

  login(
    credentials: EmployeeLoginRequest
  ): Observable<EmployeeLoginResponse> {
    return this.http
      .post<EmployeeLoginResponse>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(
        tap(response => {
          if (!response.token) {
            throw new Error('The login response did not contain a JWT.');
          }

          sessionStorage.setItem('token', response.token);
        })
      );
  }

  logout(): void {
    sessionStorage.removeItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
