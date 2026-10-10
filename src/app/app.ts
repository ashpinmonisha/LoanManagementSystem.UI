import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface Loan {
  loanApplicationId?: number;
  LoanApplicationId?: number;
  id?: number;
  customerId?: number;
  CustomerId?: number;
  customerName?: string;
  CustomerName?: string;
  loanType?: string;
  LoanType?: string;
  loanAmount?: number;
  LoanAmount?: number;
  loanTenure?: number;
  LoanTenure?: number;
  loanPurpose?: string;
  LoanPurpose?: string;
  status?: string;
  Status?: string;
  remarks?: string;
  Remarks?: string;
  riskScore?: number;
  RiskScore?: number;
  riskLevel?: string;
  RiskLevel?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  activeNav = 'Overview';

  isLoggedIn = false;
  isLoading = false;

  employeeCode = '';
  password = '';

  searchTerm = '';
  message = '';
  errorMessage = '';

  applications: Loan[] = [];
  selectedLoan: Loan | null = null;
  riskResult: any = null;

  loginForm = {
    employeeCode: '',
    password: ''
  };

  applicationForm = {
    CustomerId: 0,
    LoanType: 'Personal Loan',
    LoanAmount: 0,
    LoanTenure: 12,
    LoanPurpose: ''
  };

  riskForm = {
    MonthlyIncome: 0,
    EmploymentExperience: 0,
    ExistingLoanAmount: 0
  };

  decisionRemarks = '';

  constructor(private loanApi: LoanApiService) {}

  ngOnInit(): void {
    // Login is required before accessing the employee dashboard.
  }

  get pendingCount(): number {
    return this.applications.filter(
      loan => this.getStatus(loan).toLowerCase() === 'pending'
    ).length;
  }

  get approvedCount(): number {
    return this.applications.filter(
      loan => this.getStatus(loan).toLowerCase() === 'approved'
    ).length;
  }

  get rejectedCount(): number {
    return this.applications.filter(
      loan => this.getStatus(loan).toLowerCase() === 'rejected'
    ).length;
  }

  get filteredApplications(): Loan[] {
    const search = this.searchTerm.toLowerCase().trim();

    return this.applications.filter(loan =>
      String(this.getId(loan)).includes(search) ||
      String(this.getCustomerId(loan)).includes(search) ||
      this.getLoanType(loan).toLowerCase().includes(search) ||
      this.getStatus(loan).toLowerCase().includes(search)
    );
  }

  getId(loan: Loan): number {
    return Number(
      loan.loanApplicationId ??
      loan.LoanApplicationId ??
      loan.id ??
      0
    );
  }

  getCustomerId(loan: Loan): number {
    return Number(loan.customerId ?? loan.CustomerId ?? 0);
  }

  getCustomerName(loan: Loan): string {
    return loan.customerName ?? loan.CustomerName ?? 'Customer';
  }

  getLoanType(loan: Loan): string {
    return loan.loanType ?? loan.LoanType ?? 'Loan';
  }

  getAmount(loan: Loan): number {
    return Number(loan.loanAmount ?? loan.LoanAmount ?? 0);
  }

  getTenure(loan: Loan): number {
    return Number(loan.loanTenure ?? loan.LoanTenure ?? 0);
  }

  getStatus(loan: Loan): string {
    return loan.status ?? loan.Status ?? 'Pending';
  }

  login(): void {
    this.clearMessages();

    if (!this.loginForm.employeeCode.trim() ||
        !this.loginForm.password) {
      this.errorMessage = 'Enter your employee code and password.';
      return;
    }

    this.isLoading = true;

    this.loanApi.login(this.loginForm).subscribe({
      next: response => {
        this.isLoading = false;
        this.isLoggedIn = true;
        this.employeeCode =
          response?.employee?.employeeCode ??
          this.loginForm.employeeCode;

        this.message = response?.message ?? 'Login successful.';
        this.loadLoans();
      },
      error: error => {
  this.isLoading = false;

  console.error('Login error:', error);

  this.errorMessage =
    error.name === 'TimeoutError'
      ? 'The API did not respond within 15 seconds.'
      : typeof error.error === 'string'
        ? error.error
        : 'Login failed. Check the API connection and credentials.';
}
    });
  }

  loadLoans(): void {
    this.clearMessages();
    this.isLoading = true;

    this.loanApi.getLoans().subscribe({
      next: response => {
        const data = Array.isArray(response)
          ? response
          : response?.data ?? response?.items ?? [];

        this.applications = data;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          'Unable to load applications. Check the API and CORS settings.';
        console.error(error);
      }
    });
  }

  submitApplication(): void {
    this.clearMessages();

    if (
      this.applicationForm.CustomerId <= 0 ||
      this.applicationForm.LoanAmount <= 0 ||
      this.applicationForm.LoanTenure <= 0 ||
      !this.applicationForm.LoanPurpose.trim()
    ) {
      this.errorMessage =
        'Enter a valid customer ID, amount, tenure and loan purpose.';
      return;
    }

    this.isLoading = true;

    this.loanApi.applyLoan(this.applicationForm).subscribe({
      next: response => {
        this.isLoading = false;
        this.message =
          response?.message ?? 'Loan application submitted successfully.';

        this.applicationForm = {
          CustomerId: 0,
          LoanType: 'Personal Loan',
          LoanAmount: 0,
          LoanTenure: 12,
          LoanPurpose: ''
        };

        this.activeNav = 'Applications';
        this.loadLoans();
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : 'Unable to submit the loan application.';
        console.error(error);
      }
    });
  }

  selectLoan(loan: Loan): void {
    this.clearMessages();
    this.selectedLoan = loan;
    this.riskResult = null;
    this.decisionRemarks = '';

    this.loanApi.getLoanById(this.getId(loan)).subscribe({
      next: response => {
        this.selectedLoan = response;
      },
      error: error => {
        this.errorMessage = 'Unable to load loan details.';
        console.error(error);
      }
    });
  }

  assessRisk(): void {
    this.clearMessages();

    if (!this.selectedLoan) {
      this.errorMessage = 'Select a loan application first.';
      return;
    }

    if (
      this.riskForm.MonthlyIncome <= 0 ||
      this.riskForm.EmploymentExperience < 0 ||
      this.riskForm.ExistingLoanAmount < 0
    ) {
      this.errorMessage = 'Enter valid risk assessment details.';
      return;
    }

    this.isLoading = true;

    this.loanApi.assessRisk(
      this.getId(this.selectedLoan),
      this.riskForm
    ).subscribe({
      next: response => {
        this.isLoading = false;
        this.riskResult = response;
        this.message =
          response?.message ?? 'Risk assessment completed.';
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : 'Risk assessment failed.';
        console.error(error);
      }
    });
  }

  makeDecision(approved: boolean): void {
    this.clearMessages();

    if (!this.selectedLoan) {
      this.errorMessage = 'Select a loan application first.';
      return;
    }

    if (this.getStatus(this.selectedLoan).toLowerCase() !== 'pending') {
      this.errorMessage = 'Only pending applications can be decided.';
      return;
    }

    if (!this.decisionRemarks.trim()) {
      this.errorMessage = 'Enter remarks before making a decision.';
      return;
    }

    this.isLoading = true;

    this.loanApi.decideLoan(
      this.getId(this.selectedLoan),
      approved,
      this.decisionRemarks.trim()
    ).subscribe({
      next: response => {
        this.isLoading = false;
        this.message =
          response?.message ??
          (approved ? 'Loan approved.' : 'Loan rejected.');

        this.selectedLoan = null;
        this.loadLoans();
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : 'Decision failed. Check employee authorization and JWT settings.';
        console.error(error);
      }
    });
  }

  setActiveNav(nav: string): void {
    this.activeNav = nav;
    this.clearMessages();

    if (nav === 'Applications' || nav === 'Overview') {
      this.loadLoans();
    }

    if (nav === 'New Application') {
      this.selectedLoan = null;
    }
  }

  logout(): void {
    this.loanApi.logout();

    this.isLoggedIn = false;
    this.employeeCode = '';
    this.loginForm = { employeeCode: '', password: '' };
    this.applications = [];
    this.selectedLoan = null;
    this.riskResult = null;
    this.activeNav = 'Overview';
    this.clearMessages();
  }

  clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}