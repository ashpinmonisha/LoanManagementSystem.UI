
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LoanApplicationService } from './loan-application.service';
import { LoanApplicationRequest } from '../../../core/models/loan.model';


@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './loan-application.html',
  styleUrl: './Loan-Application.css'
})
export class LoanApplicationComponent {
  private readonly service = inject(LoanApplicationService);
  private readonly router = inject(Router);

  customerId: number | null = null;
  loanType = 'Personal';
  loanAmount: number | null = null;
  loanTenure: number | null = 12;
  loanPurpose = '';

  loading = false;
  errorMessage = '';

  submit(): void {
    this.errorMessage = '';

    if (
      this.customerId === null ||
      !Number.isInteger(this.customerId) ||
      this.customerId <= 0 ||
      this.loanAmount === null ||
      this.loanAmount <= 0 ||
      this.loanTenure === null ||
      !Number.isInteger(this.loanTenure) ||
      this.loanTenure <= 0 ||
      !this.loanPurpose.trim()
    ) {
      this.errorMessage = 'Complete all fields with valid values.';
      return;
    }

    const request: LoanApplicationRequest = {
      customerId: this.customerId,
      loanType: this.loanType,
      loanAmount: this.loanAmount,
      loanTenure: this.loanTenure,
      loanPurpose: this.loanPurpose.trim()
    };

    this.loading = true;

    this.service.createApplication(request).subscribe({
      next: response => {
        this.loading = false;
        this.router.navigate(['/loan-approval', response.loanId]);
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : 'Could not submit the loan application.';
      }
    });
  }
}
