import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { RecordPayment } from './payment';

export interface PaymentReceipt extends RecordPayment {
  paymentId: string | number;
  paymentStatus: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentReceiptService {
  private readonly document = inject(DOCUMENT);

  create(request: RecordPayment, response: any): PaymentReceipt {
    return {
      ...request,
      paymentId: response?.paymentId ?? 'Not provided',
      paymentStatus: response?.paymentStatus || 'Recorded — awaiting verification',
      paymentReference: response?.paymentReference || request.paymentReference,
    };
  }

  render(receipt: PaymentReceipt): string {
    const escape = (value: unknown) => String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]!);
    const date = new Date(receipt.paymentDate);
    const rows: [string, unknown][] = [
      ['Payment ID', receipt.paymentId], ['Status', receipt.paymentStatus],
      ['Customer ID', receipt.customerId], ['Loan ID', receipt.loanId], ['EMI ID', receipt.emiId],
      ['Amount', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(receipt.amount)],
      ['Payment date', Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
      }).format(date) + ' IST' : receipt.paymentDate],
      ['Payment method', receipt.paymentMethod], ['Transaction reference', receipt.paymentReference],
    ];
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LoanSphere payment receipt</title>
      <style>body{font-family:Arial,sans-serif;color:#17233d;max-width:700px;margin:40px auto;padding:24px}h1{color:#2456a6}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:14px;border-bottom:1px solid #ddd;overflow-wrap:anywhere}th{width:40%}.note{color:#526078;line-height:1.6}@media print{body{margin:0}.print-hint{display:none}}</style></head><body>
      <h1>LoanSphere</h1><h2>Payment receipt</h2><table>${rows.map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('')}</table>
      <p class="note">This receipt acknowledges the recorded payment. Transaction verification is reflected in the status above.</p>
      <p class="note print-hint">To print or save as PDF, use your browser's Print option (Ctrl+P).</p></body></html>`;
  }

  download(receipt: PaymentReceipt): void {
    const url = URL.createObjectURL(new Blob([this.render(receipt)], { type: 'text/html;charset=utf-8' }));
    const link = this.document.createElement('a');
    link.href = url;
    const id = String(receipt.paymentId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60) || 'recorded';
    link.download = `payment-receipt-loan-${receipt.loanId}-${id}.html`;
    this.document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
