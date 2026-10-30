import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import {
  CustomerEligibilityProfile,
  CustomerEligibilityResult,
  CustomerProfile,
  KycDocument,
} from '../../core/models/customer.model';
import { CustomerAuthService } from '../../core/services/customer-auth';
import { CustomerManagementService } from '../../core/services/customer-management';
import { EmiAllocationService, EmiDetails, EmiOutstanding } from '../../core/services/emi-allocation';
import { PaymentHistory, PaymentService } from '../../core/services/payment';
import { CustomerPaymentsComponent } from './customer-payments';

type PortalSection = 'dashboard' | 'loans' | 'schedule' | 'payments' | 'profile' | 'kyc' | 'eligibility';

@Component({
  selector: 'app-customer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerPaymentsComponent],
  templateUrl: './customer-portal.html',
  styleUrl: './customer-portal.css',
})
export class CustomerPortalComponent implements OnInit {
  private readonly auth = inject(CustomerAuthService);
  private readonly service = inject(CustomerManagementService);
  private readonly emiService = inject(EmiAllocationService);
  private readonly paymentService = inject(PaymentService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly customer = this.auth.getCustomer();
  readonly today = new Date().toISOString().slice(0, 10);
  section: PortalSection = 'dashboard';
  dashboardLoanId: number | null = null;
  dashboardOutstanding: EmiOutstanding | null = null;
  dashboardHistory: PaymentHistory[] = [];
  dashboardLoading = false;
  dashboardError = '';
  dashboardHistoryError = '';
  private dashboardRequestId = 0;

  profile: CustomerProfile | null = null;
  profileLoading = true;
  profileSaving = false;
  profileError = '';
  profileSuccess = '';
  fullName = '';
  phoneNumber = '';
  dateOfBirth = '';
  gender = '';

  documents: KycDocument[] = [];
  documentsLoading = true;
  documentType = '';
  documentNumber = '';
  expiryDate = '';
  selectedFile: File | null = null;
  uploadLoading = false;
  kycError = '';
  kycSuccess = '';

  eligibility: CustomerEligibilityProfile = this.emptyEligibility();
  eligibilityLoading = true;
  eligibilitySaving = false;
  eligibilityChecking = false;
  eligibilitySaved = false;
  eligibilityError = '';
  eligibilitySuccess = '';
  eligibilityResult: CustomerEligibilityResult | null = null;

  get tomorrow(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }

  get nextEmi(): EmiDetails | null {
    return (this.dashboardOutstanding?.emis ?? [])
      .filter(emi => emi.remainingAmount > 0 && !['paid', 'completed'].includes(emi.status.toLowerCase()))
      .slice()
      .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate))[0] ?? null;
  }

  get dashboardEmis(): EmiDetails[] {
    return (this.dashboardOutstanding?.emis ?? [])
      .slice()
      .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate));
  }

  get recentPayments(): PaymentHistory[] {
    return this.dashboardHistory
      .slice()
      .sort((a, b) => Date.parse(b.paymentDate) - Date.parse(a.paymentDate))
      .slice(0, 4);
  }

  get repaymentPercent(): number {
    const total = this.dashboardOutstanding?.totalEmiAmount ?? 0;
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, ((this.dashboardOutstanding?.totalPaid ?? 0) / total) * 100));
  }

  get remainingPercent(): number {
    return this.dashboardOutstanding?.totalEmiAmount
      ? Math.min(100, Math.max(0, 100 - this.repaymentPercent))
      : 0;
  }

  get dashboardPaymentStatus(): string {
    if (!this.dashboardOutstanding) return 'Add a loan to get started';
    if (this.dashboardOutstanding.overdueAmount > 0) return 'Payment overdue';
    return this.nextEmi ? 'Payment due soon' : 'Up to date';
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadDocuments();
    this.loadEligibility();
  }

  loadDashboardLoan(): void {
    this.dashboardError = '';
    this.dashboardHistoryError = '';
    this.dashboardOutstanding = null;
    this.dashboardHistory = [];

    if (!Number.isInteger(this.dashboardLoanId) || !this.dashboardLoanId || this.dashboardLoanId < 1) {
      this.dashboardError = 'Enter a valid loan ID to load its payment dashboard.';
      return;
    }

    const loanId = this.dashboardLoanId;
    const requestId = ++this.dashboardRequestId;
    this.dashboardLoading = true;

    forkJoin({
      outstanding: this.emiService.getOutstanding(loanId, true).pipe(
        catchError((error: HttpErrorResponse) => {
          if (requestId === this.dashboardRequestId) {
            this.dashboardError = this.errorMessage(
              error,
              'Unable to load EMIs for this loan.',
              'This loan could not be found for your customer account.',
            );
          }
          return of(null);
        }),
      ),
      history: this.paymentService.getHistory(loanId, true).pipe(
        catchError((error: HttpErrorResponse) => {
          if (requestId === this.dashboardRequestId) {
            this.dashboardHistoryError = this.errorMessage(
              error,
              'Unable to load payment history.',
              'Payment history is unavailable for this loan.',
            );
          }
          return of(null);
        }),
      ),
    }).subscribe(({ outstanding, history }) => {
      if (requestId !== this.dashboardRequestId) return;
      this.dashboardOutstanding = outstanding;
      this.dashboardHistory = history ?? [];
      this.dashboardLoading = false;
      this.cdr.markForCheck();
    });
  }

  openPayments(): void {
    this.section = 'payments';
  }

  loadProfile(): void {
    this.profileLoading = true;
    this.profileError = '';
    this.service.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.fullName = profile.fullName;
        this.phoneNumber = profile.phoneNumber;
        this.dateOfBirth = profile.dateOfBirth?.slice(0, 10) ?? '';
        this.gender = profile.gender ?? '';
        this.profileLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.profileLoading = false;
        this.profileError = this.errorMessage(error, 'Unable to load your profile.');
        this.cdr.markForCheck();
      },
    });
  }

  saveProfile(): void {
    this.profileError = '';
    this.profileSuccess = '';
    this.profileSaving = true;
    this.service
      .updateProfile({
        fullName: this.fullName.trim(),
        phoneNumber: this.phoneNumber.trim(),
        dateOfBirth: this.dateOfBirth || null,
        gender: this.gender || null,
      })
      .subscribe({
        next: (updated) => {
          if (this.profile) this.profile = { ...this.profile, ...updated };
          this.profileSuccess = 'Your profile has been updated.';
          this.profileSaving = false;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.profileError = this.errorMessage(error, 'Unable to update your profile.');
          this.profileSaving = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadDocuments(): void {
    this.documentsLoading = true;
    this.kycError = '';
    this.service.getKycDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.documentsLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.documentsLoading = false;
        this.kycError = this.errorMessage(error, 'Unable to load your KYC documents.');
        this.cdr.markForCheck();
      },
    });
  }

  selectFile(event: Event): void {
    this.kycError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.selectedFile = null;
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
      this.kycError = 'Choose a PDF, JPG, JPEG or PNG document.';
      input.value = '';
      this.selectedFile = null;
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.kycError = 'The document must be 5 MB or smaller.';
      input.value = '';
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
  }

  uploadDocument(): void {
    this.kycError = '';
    this.kycSuccess = '';
    if (!this.documentType || !this.documentNumber.trim() || !this.selectedFile) {
      this.kycError = 'Choose a document type, enter its number and select a file.';
      return;
    }

    this.uploadLoading = true;
    this.service
      .uploadKycDocument(
        this.documentType,
        this.documentNumber.trim(),
        this.selectedFile,
        this.expiryDate || null,
      )
      .subscribe({
        next: (response) => {
          this.kycSuccess =
            response.message || 'Your document has been submitted for verification.';
          this.documentType = '';
          this.documentNumber = '';
          this.expiryDate = '';
          this.selectedFile = null;
          this.uploadLoading = false;
          this.loadDocuments();
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.kycError = this.errorMessage(error, 'Unable to upload your document.');
          this.uploadLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadEligibility(): void {
    const customerId = this.customer?.customerId;
    if (!customerId) {
      this.eligibilityLoading = false;
      this.eligibilityError = 'Your customer session is missing an ID. Please sign in again.';
      return;
    }

    this.eligibilityLoading = true;
    this.eligibilityError = '';
    this.service.getEligibility(customerId).subscribe({
      next: (profile) => {
        this.eligibility = { ...this.emptyEligibility(), ...profile };
        this.eligibilitySaved = true;
        this.eligibilityLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.eligibilityLoading = false;
        if (error.status === 404) {
          this.eligibility = this.emptyEligibility();
          this.eligibilitySaved = false;
        } else {
          this.eligibilityError = this.errorMessage(
            error,
            'Unable to load your financial profile.',
          );
        }
        this.cdr.markForCheck();
      },
    });
  }

  saveEligibility(): void {
    if (!this.customer?.customerId) {
      this.eligibilityError = 'Your customer session is missing an ID. Please sign in again.';
      return;
    }
    this.eligibilityError = '';
    this.eligibilitySuccess = '';
    this.eligibilityResult = null;
    this.eligibilitySaving = true;
    const request = { ...this.eligibility, customerId: this.customer.customerId };
    this.service.saveEligibility(request).subscribe({
      next: (profile) => {
        this.eligibility = { ...request, ...profile };
        this.eligibilitySaved = true;
        this.eligibilitySuccess = 'Your financial profile has been saved.';
        this.eligibilitySaving = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.eligibilityError = this.errorMessage(error, 'Unable to save your financial profile.');
        this.eligibilitySaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  checkEligibility(): void {
    if (!this.customer?.customerId) return;
    this.eligibilityError = '';
    this.eligibilityResult = null;
    this.eligibilityChecking = true;
    this.service.checkEligibility(this.customer.customerId).subscribe({
      next: (result) => {
        this.eligibilityResult = result;
        this.eligibilityChecking = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.eligibilityError = this.errorMessage(error, 'Unable to check eligibility.');
        this.eligibilityChecking = false;
        this.cdr.markForCheck();
      },
    });
  }

  logout(): void {
    this.auth.logout();
    window.location.assign('/customer/login');
  }

  private emptyEligibility(): CustomerEligibilityProfile {
    return {
      customerId: this.customer?.customerId ?? 0,
      monthlyIncome: 0,
      employmentType: '',
      employmentStatus: '',
      employerName: '',
      employmentExperienceYears: 0,
      creditScore: 0,
      existingLoanCount: 0,
      existingMonthlyObligations: 0,
      existingLoanAmount: 0,
      financialProfileRemarks: '',
    };
  }

  private errorMessage(
    error: HttpErrorResponse,
    fallback: string,
    notFound = 'The requested customer information could not be found.',
  ): string {
    if (error.status === 0)
      return 'Cannot connect to the backend. Check that the API is running and /api is proxied to it.';
    if (error.status === 401) return 'Your session has expired. Sign in again to continue.';
    if (error.status === 403 || error.status === 404) return notFound;
    return error.error?.message ?? error.error?.title ?? fallback;
  }
}
