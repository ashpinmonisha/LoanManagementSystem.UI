export interface EmiResponse {
  loanAmount: number;
  interestRate: number;
  loanTenureMonths: number;
  monthlyEmi: number;
}

export interface InterestResponse {
  principalAmount: number;
  monthlyInterest: number;
  totalInterest: number;
  totalRepayment: number;
}

export interface RepaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface RepaymentScheduleResponse {
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  installments: RepaymentInstallment[];
}

export interface AmortizationResponse {
  principalVsInterest: {
    totalPrincipal: number;
    totalInterest: number;
    principalPercentage: number;
    interestPercentage: number;
  };
  totalRepayment: number;
  interestToPrincipalRatio: number;
  monthlyBalances: { installmentNumber: number; dueDate: string; balance: number }[];
}

export interface PrepaymentResponse {
  prepaymentAmount: number;
  outstandingBeforePrepayment: number;
  newOutstanding: number;
  interestSaved: number;
  originalTenureMonths: number;
  revisedTenureMonths: number;
  monthsSaved: number;
  originalTotalInterest: number;
  revisedTotalInterest: number;
  revisedSchedule: RepaymentInstallment[];
}

export interface LoanOptionResult {
  label: string;
  loanAmount: number;
  interestRate: number;
  loanTenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
}

export interface LoanComparisonResponse {
  options: LoanOptionResult[];
  lowestInterestRateOption: string;
  shortestTenureOption: string;
  lowestEmiOption: string;
  lowestTotalInterestOption: string;
}

export interface FinancialSummaryResponse {
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  emiSummary: {
    monthlyEmi: number;
    loanTenureMonths: number;
    numberOfInstallments: number;
    averageMonthlyInterest: number;
  };
  loanCostAnalysis: {
    interestToPrincipalRatio: number;
    totalCostPercentage: number;
    interestPerHundredBorrowed: number;
  };
}

export interface CalculationHistory {
  id: string;
  calculationType: string;
  loanAmount: number;
  interestRate: number;
  loanTenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  calculatedAtUtc: string;
}