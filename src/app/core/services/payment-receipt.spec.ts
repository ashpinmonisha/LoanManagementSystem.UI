import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { PaymentReceiptService } from './payment-receipt';
import { PaymentService, RecordPayment } from './payment';
import { MakePayment } from '../../features/payment-management/make-payment/make-payment';
import { PaymentForm } from '../../features/payment-management/payment-form/payment-form';

const request: RecordPayment = { customerId: 1, loanId: 2, emiId: 3, amount: 2500, paymentDate: '2026-10-17T06:00:00Z', paymentMethod: 'UPI', paymentReference: 'REF123' };

describe('Payment receipts', () => {
  it('renders receipt values safely and preserves the server status', () => {
    const service = TestBed.inject(PaymentReceiptService);
    const receipt = service.create(request, { paymentId: 10, paymentStatus: 'Pending', paymentReference: '<script>alert(1)</script>' });
    const html = service.render(receipt);
    expect(html).toContain('Pending');
    expect(html).toContain('2,500.00');
    expect(html).toContain('IST');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(service.create(request, {}).paymentStatus).toContain('awaiting verification');
  });

  for (const componentType of [MakePayment, PaymentForm]) {
    it(`${componentType.name} offers the recorded receipt with immutable submitted values`, async () => {
      const result = new Subject<any>();
      const recordPayment = vi.fn(() => result.asObservable());
      TestBed.configureTestingModule({ providers: [{ provide: PaymentService, useValue: { recordPayment } }] });
      const fixture = TestBed.createComponent(componentType as typeof MakePayment);
      const component = fixture.componentInstance as MakePayment | PaymentForm;
      Object.assign(component.payment, request);
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).not.toContain('Download receipt');
      if (component instanceof MakePayment) component.payNow(); else component.submitPayment();
      component.payment.amount = 999;
      result.next({ paymentId: 10, paymentStatus: 'Success' });
      result.complete();
      await fixture.whenStable();
      expect(component.receipt?.amount).toBe(2500);
      expect(component.receipt?.paymentId).toBe(10);
      expect(fixture.nativeElement.textContent).toContain('Download receipt');
      const download = vi.spyOn(TestBed.inject(PaymentReceiptService), 'download').mockImplementation(() => {});
      component.downloadReceipt();
      expect(download).toHaveBeenCalledWith(component.receipt);
    });

    it(`${componentType.name} does not offer a receipt when recording fails`, async () => {
      const result = new Subject<any>();
      TestBed.configureTestingModule({ providers: [{ provide: PaymentService, useValue: { recordPayment: () => result.asObservable() } }] });
      const fixture = TestBed.createComponent(componentType as typeof MakePayment);
      const component = fixture.componentInstance as MakePayment | PaymentForm;
      Object.assign(component.payment, request);
      await fixture.whenStable();
      if (component instanceof MakePayment) component.payNow(); else component.submitPayment();
      result.error({ error: { message: 'Payment rejected' } });
      await fixture.whenStable();
      expect(component.receipt).toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Download receipt');
      expect(fixture.nativeElement.textContent).toContain('Payment rejected');
    });
  }
});
