import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable } from 'rxjs';
import { LoanRequest } from '../models/loan-request';

/** Holds result, error and loading state for one API request. */
export class ApiCall<T> {
  readonly result = signal<T | null>(null);
  readonly error = signal<string[] | null>(null);
  readonly loading = signal(false);

  run(source: Observable<T>): void {
    this.result.set(null);
    this.error.set(null);
    this.loading.set(true);

    source.subscribe({
      next: (data) => {
        this.result.set(data);
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(toMessages(e));
        this.loading.set(false);
      }
    });
  }
}

export function toMessages(e: HttpErrorResponse): string[] {
  if (e.status === 0) {
    return ['Cannot reach the API. Make sure the backend is running on https://localhost:7085.'];
  }
  const errors = e.error?.errors;
  if (errors) return (Object.values(errors) as string[][]).flat();
  return [e.error?.detail ?? e.error?.title ?? 'Request failed.'];
}

export function defaultLoan(): LoanRequest {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);

  return {
    loanAmount: 500000,
    interestRate: 10.5,
    loanTenureMonths: 24,
    startDate: next.toISOString().split('T')[0]
  };
}