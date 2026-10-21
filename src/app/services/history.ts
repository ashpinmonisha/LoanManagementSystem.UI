import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CalculationHistory } from '../models/loan-response';

@Injectable({ providedIn: 'root' })
export class History {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<CalculationHistory[]>('/api/emi/history');
  }
}