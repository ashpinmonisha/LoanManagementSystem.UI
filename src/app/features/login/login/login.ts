import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from './login.service';
import { EmployeeLoginRequest } from '../../../core/models/loan.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  employeeCode = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  submitLogin(): void {
    this.errorMessage = '';

    if (!this.employeeCode.trim() || !this.password) {
      this.errorMessage = 'Enter your employee code and password.';
      return;
    }

    const request: EmployeeLoginRequest = {
      employeeCode: this.employeeCode.trim(),
      password: this.password,
    };

    this.loading = true;

    this.loginService.login(request).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.employee.role?.toLowerCase() !== 'employee') {
          this.loginService.logout();
          this.errorMessage = 'This account does not have the Employee role.';
          this.cdr.markForCheck();
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        this.errorMessage =
          error.status === 401
            ? 'Invalid employee code or password.'
            : error.status === 0
              ? 'Cannot connect to the API. Check the backend and HTTPS certificate.'
              : 'Login failed. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }
}
