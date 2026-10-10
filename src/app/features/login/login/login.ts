
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  LoginService,
  EmployeeLoginRequest
} from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './Login.css'
})
export class LoginComponent {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  employeeId: number | null = null;
  password = '';

  loading = false;
  showPassword = false;
  errorMessage = '';

  submitLogin(): void {
    this.errorMessage = '';

    if (!this.employeeId || this.employeeId <= 0 || !this.password) {
      this.errorMessage = 'Enter your employee ID and password.';
      return;
    }

    const credentials: EmployeeLoginRequest = {
      employeeId: this.employeeId,
      password: this.password
    };

    this.loading = true;

    this.loginService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.loading = false;

        this.errorMessage =
          error.status === 401
            ? 'Invalid employee ID or password.'
            : error.status === 0
              ? 'Cannot connect to the backend. Check that the API is running.'
              : 'Login failed. Please verify your details and try again.';
      }
    });
  }
}
