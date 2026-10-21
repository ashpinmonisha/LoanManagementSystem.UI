export interface LoanRequest {
  loanAmount: number;
  interestRate: number;
  loanTenureMonths: number;
  startDate?: string;
}

export interface PrepaymentRequest extends LoanRequest {
  installmentsPaid: number;
  prepaymentAmount: number;
}

export interface CompareOption {
  loanAmount: number;
  interestRate: number;
  loanTenureMonths: number;
}