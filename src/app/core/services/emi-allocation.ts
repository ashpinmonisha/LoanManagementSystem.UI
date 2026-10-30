import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';
import { API_BASE_URL } from '../api-url';

export interface EmiDetails {
  emiId: number;
  loanId: number;
  emiAmount: number;
  amountPaid: number;
  remainingAmount: number;
  dueDate: string;
  status: string;
}

export interface EmiOutstanding {
  loanId: number;
  totalEmiAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  emis: EmiDetails[];
}

export interface EmiAllocationResult {
  allocationId: number;
  paymentId: number;
  emiId: number;
  allocatedAmount: number;
  allocationStatus: string;
  emiStatus: string;
  remainingEmiAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmiAllocationService {

  private http = inject(HttpClient);

  private readonly api = `${API_BASE_URL}/EmiAllocations`;

  allocate(paymentId: number, emiId: number) {
    return this.http.post<EmiAllocationResult>(
      `${this.api}/allocate`,
      { paymentId, emiId }
    );
  }

  getOutstanding(loanId: number, customerPortal = false) {
    return this.http.get<EmiOutstanding>(
      `${this.api}/outstanding/${loanId}`,
      customerPortal ? { context: new HttpContext().set(CUSTOMER_PORTAL_REQUEST, true) } : {},
    );
  }
}