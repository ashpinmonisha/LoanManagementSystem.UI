import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CustomerEligibilityProfile,
  CustomerEligibilityResult,
  CustomerProfile,
  KycDocument,
} from '../../core/models/customer.model';
import { CustomerAuthService } from '../../core/services/customer-auth';
import { CustomerManagementService } from '../../core/services/customer-management';

type PortalSection = 'profile' | 'kyc' | 'eligibility';

@Component({
  selector: 'app-customer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-portal.html',
  styleUrl: './customer-portal.css',
})
export class CustomerPortalComponent implements OnInit {
  private readonly auth = inject(CustomerAuthService);
  private readonly service = inject(CustomerManagementService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly customer = this.auth.getCustomer();
  readonly today = new Date().toISOString().slice(0, 10);
  section: PortalSection = 'profile';

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

  ngOnInit(): void {
    this.loadProfile();
    this.loadDocuments();
    this.loadEligibility();
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

  private errorMessage(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 0)
      return 'Cannot connect to the API. Check the backend and HTTPS certificate.';
    if (error.status === 401) return 'Your session has expired. Sign in again to continue.';
    return error.error?.message ?? error.error?.title ?? fallback;
  }
}
