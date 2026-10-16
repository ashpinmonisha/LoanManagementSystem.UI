
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { RiskAssessmentService } from './risk-assessment.service';
import { RiskAssessmentResponse } from '../../core/models/loan.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-risk-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './risk-assessment.html',
  styleUrl: './Risk-Assessment.css'
})
export class RiskAssessmentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RiskAssessmentService);

  loanId = Number(this.route.snapshot.paramMap.get('id'));

  monthlyIncome: number | null = null;
  employmentExperience: number | null = null;
  existingLoanAmount: number | null = 0;

  result: RiskAssessmentResponse | null = null;
  loading = false;
  errorMessage = '';

  get riskClass(): string {
    return (this.result?.riskLevel ?? '').toLowerCase();
  }

  get validLoanId(): boolean {
    return Number.isInteger(this.loanId) && this.loanId > 0;
  }

 

assess(): void {
  this.errorMessage = '';
  this.result = null;

  if (!this.validLoanId) {
    this.errorMessage = 'Invalid loan application ID.';
    return;
  }

  if (
    this.monthlyIncome === null ||
    !Number.isFinite(this.monthlyIncome) ||
    this.monthlyIncome <= 0 ||
    this.employmentExperience === null ||
    !Number.isInteger(this.employmentExperience) ||
    this.employmentExperience < 0 ||
    this.existingLoanAmount === null ||
    !Number.isFinite(this.existingLoanAmount) ||
    this.existingLoanAmount < 0
  ) {
    this.errorMessage = 'Please enter valid assessment values.';
    return;
  }

  this.loading = true;

  console.log('Sending risk assessment request', {
    loanId: this.loanId,
    monthlyIncome: this.monthlyIncome,
    employmentExperience: this.employmentExperience,
    existingLoanAmount: this.existingLoanAmount
  });

  this.service.assessRisk(this.loanId, {
    monthlyIncome: this.monthlyIncome,
    employmentExperience: this.employmentExperience,
    existingLoanAmount: this.existingLoanAmount
  })
  .pipe(
    finalize(() => {
      this.loading = false;
    })
  )
  .subscribe({
   
   next: (response: RiskAssessmentResponse) => {
  console.log('Risk assessment response:', response);

  this.result = response;
  this.loading = false;
},

  
error: (error) => {
  console.error('Risk assessment API error:', error);

  this.loading = false;
  this.errorMessage =
    error.error?.message ||
    error.error?.title ||
    `Risk assessment failed. HTTP status: ${error.status}`;
}

  });
}

  scoreWidth(score: number): number {
    return Math.max(0, Math.min(100, score));
  }
}
