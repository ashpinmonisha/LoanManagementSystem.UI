import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  private api =
    'https://localhost:7085/api/EmiAllocations';

  allocate(paymentId: number, emiId: number) {
    return this.http.post<EmiAllocationResult>(
      `${this.api}/allocate`,
      { paymentId, emiId }
    );
  }

  getOutstanding(loanId: number) {
    return this.http.get<EmiOutstanding>(
      `${this.api}/outstanding/${loanId}`
    );
  }
}