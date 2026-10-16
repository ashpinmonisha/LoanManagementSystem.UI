
export interface EmployeeLoginRequest {
  employeeCode: string;
  password: string;
}

export interface Employee {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  role: string;
  token: string;
}

export interface EmployeeLoginResponse {
  message: string;
  employee: Employee;
}

export interface LoanApplicationRequest {
  customerId: number;
  loanType: string;
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
}

export interface LoanApplication {
  loanApplicationId: number;
  customerId: number;
  loanType: string;
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
  applicationDate: string;
  status: string;
  remarks: string | null;
  reviewedByEmployeeId: number | null;
  reviewedDate: string | null;
}

export interface LoanApplicationResponse {
  message: string;
  loanId: number;
  status: string;
}

export interface LoanDecisionRequest {
  approved: boolean;
  remarks: string;
}

export interface LoanDecisionResponse {
  message: string;
  loanId: number;
  status: string;
  remarks: string;
}


export interface RiskAssessmentRequest {
  monthlyIncome: number;
  employmentExperience: number;
  existingLoanAmount: number;
}

export interface RiskAssessmentResponse {
  message: string;
  loanId: number;
  riskScore: number;
  riskLevel: string;
  recommendation: string;
}
