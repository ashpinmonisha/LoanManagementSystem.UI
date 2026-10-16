import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoanApplication } from '../../core/models/loan.model';
import { LoanApprovalService } from './loan-approval.service';

@Component({
  selector: 'app-loan-approval',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './loan-approval.html',
  styleUrl: './loan-approval.css'
})
export class LoanApprovalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(LoanApprovalService);
  private readonly cdr = inject(ChangeDetectorRef);

  // route is 'loan-approval/:id', so the param name must be 'id'
  loanId = Number(this.route.snapshot.paramMap.get('id'));

  loan: LoanApplication | null = null;
  remarks = '';
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadLoan();
  }

  get isPending(): boolean {
    return String(this.loan?.status ?? '').toLowerCase() === 'pending';
  }

  get statusClass(): string {
    return String(this.loan?.status ?? '').toLowerCase();
  }

  loadLoan(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getLoan(this.loanId).subscribe({
      next: loan => {
        this.loan = loan;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage =
          err.status === 404
            ? 'Loan application not found.'
            : err.status === 401
              ? 'Your session expired. Please log in again.'
              : 'Unable to load the application.';
        this.cdr.markForCheck();
      }
    });
  }

  decide(approved: boolean): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!approved && !this.remarks.trim()) {
      this.errorMessage = 'Please add remarks when rejecting a loan.';
      return;
    }

    this.saving = true;

    this.service
      .makeDecision(this.loanId, {
        approved,
        remarks: this.remarks.trim()
      })
      .subscribe({
        next: response => {
          this.saving = false;
          this.successMessage = response.message;
          this.remarks = '';
          this.loadLoan();
        },
        error: (err: HttpErrorResponse) => {
          this.saving = false;
          this.errorMessage =
            err.status === 403
              ? 'Only employees can approve or reject loans.'
              : err.status === 404
                ? 'Loan application not found.'
                : 'Could not save the decision. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }
}