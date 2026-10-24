import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerRegistrationRequest } from '../../core/models/customer.model';
import { CustomerAuthService } from '../../core/services/customer-auth';

@Component({
  selector: 'app-customer-registration',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './customer-registration.html',
  styleUrl: './customer-auth.css',
})
export class CustomerRegistrationComponent {
  private readonly auth = inject(CustomerAuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly today = new Date().toISOString().slice(0, 10);
  fullName = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  dateOfBirth = '';
  gender = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.passwordsMatch) {
      this.errorMessage = 'The passwords do not match.';
      return;
    }

    const request: CustomerRegistrationRequest = {
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim(),
      password: this.password,
      confirmPassword: this.confirmPassword,
      dateOfBirth: this.dateOfBirth || null,
      gender: this.gender || null,
    };

    this.loading = true;
    this.auth.register(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || 'Account created. Sign in to continue.';
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage =
          error.status === 0
            ? 'Cannot connect to the API. Check the backend and HTTPS certificate.'
            : this.errorFrom(error, 'Registration failed. Please check your details.');
        this.cdr.markForCheck();
      },
    });
  }

  private errorFrom(error: HttpErrorResponse, fallback: string): string {
    const body = error.error;
    if (typeof body === 'string') return body;
    if (body?.message) return body.message;
    if (body?.title) return body.title;
    if (body?.errors) return Object.values(body.errors).flat().join(' ');
    return fallback;
  }
}
