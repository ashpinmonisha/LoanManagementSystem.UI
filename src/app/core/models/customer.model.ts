export interface CustomerSession {
  customerId: number;
  fullName: string;
  email: string;
  token: string;
}

export interface CustomerProfile extends Omit<CustomerSession, 'token'> {
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface CustomerRegistrationRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string | null;
  gender: string | null;
}

export interface CustomerRegistrationResponse {
  message: string;
  customerId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerProfileUpdateRequest {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
}

export interface CustomerEligibilityProfile {
  customerId: number;
  monthlyIncome: number;
  employmentType: string;
  employmentStatus: string;
  employerName: string | null;
  employmentExperienceYears: number;
  creditScore: number;
  existingLoanCount: number;
  existingMonthlyObligations: number;
  existingLoanAmount: number;
  financialProfileRemarks: string | null;
}

export interface CustomerEligibilityResult {
  customerId: number;
  eligible: boolean;
  monthlyIncome: number;
  creditScore: number;
  disposableIncome: number;
  message: string;
}

export interface KycDocument {
  kycDocumentId: number;
  customerId: number;
  documentType: string;
  verificationStatus: string;
  uploadedAt: string;
  expiryDate: string | null;
  remarks: string | null;
}

export interface KycUploadResponse {
  message: string;
  kycDocumentId: number;
  customerId: number;
  documentType: string;
  verificationStatus: string;
  uploadedAt: string;
}
