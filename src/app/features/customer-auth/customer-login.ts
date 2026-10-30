import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerAuthService } from '../../core/services/customer-auth';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './customer-login.html',
  styleUrl: './customer-auth.css',
})
export class CustomerLoginComponent {
  private readonly auth = inject(CustomerAuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  submit(): void {
    this.errorMessage = '';
    const email = this.email.trim();
    if (!email || !this.password) {
      this.errorMessage = 'Enter your email and password.';
      return;
    }

    this.loading = true;
    this.auth.login({ email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/customer']),
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage =
          error.status === 401
            ? 'That email and password combination was not recognized.'
            : error.status === 0
              ? 'Cannot connect to the API. Check the backend and HTTPS certificate.'
              : this.errorFrom(error, 'Unable to sign in. Please try again.');
        this.cdr.markForCheck();
      },
    });
  }

  private errorFrom(error: HttpErrorResponse, fallback: string): string {
    return error.error?.message ?? error.error?.title ?? fallback;
  }
}
