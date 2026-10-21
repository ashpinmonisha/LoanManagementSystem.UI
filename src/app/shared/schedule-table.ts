import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RepaymentInstallment } from '../models/loan-response';

@Component({
  selector: 'app-schedule-table',
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Installment No.</th>
            <th>Due Date</th>
            <th>EMI Amount</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Remaining Balance</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.installmentNumber) {
            <tr>
              <td>{{ r.installmentNumber }}</td>
              <td>{{ r.dueDate | date: 'dd MMM yyyy' }}</td>
              <td>{{ r.emiAmount | number: '1.2-2' }}</td>
              <td>{{ r.principal | number: '1.2-2' }}</td>
              <td>{{ r.interest | number: '1.2-2' }}</td>
              <td>{{ r.remainingBalance | number: '1.2-2' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ScheduleTable {
  readonly rows = input.required<RepaymentInstallment[]>();
}