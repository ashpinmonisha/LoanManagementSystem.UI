import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from '../../app.routes';
import { LoginService } from '../login/login/login.service';
import { LoanApplicationService } from '../loan-application/loan-application/loan-application.service';
import { PaymentService } from '../../core/services/payment';

describe('Employee payment navigation', () => {
  it('opens customer payment records from the employee Payments sidebar', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: LoginService, useValue: {
          isLoggedIn: () => true,
          isEmployee: () => true,
          getEmployee: () => ({ employeeName: 'Employee' }),
        } },
        { provide: LoanApplicationService, useValue: { getApplications: () => of([]) } },
        { provide: PaymentService, useValue: {} },
      ],
    });
    const harness = await RouterTestingHarness.create('/dashboard');
    const router = TestBed.inject(Router);
    const link = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.sidebar a[href="/dashboard/payments"]')!;
    expect(link).not.toBeNull();
    link.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe('/dashboard/payments/record');
    expect(harness.routeNativeElement!.querySelector('app-employee-payment-records')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('.stats')).toBeNull();
    expect(harness.routeNativeElement!.querySelector('.payment-navigation')).toBeNull();
    const dashboardRoute = routes.find(route => route.path === 'dashboard')!;
    expect(dashboardRoute.children?.filter(route => route.loadComponent).map(route => route.path)).toEqual(['payments/record']);
    await harness.navigateByUrl('/dashboard#growth');
    expect(harness.routeNativeElement!.querySelector('#growth')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('.payment-navigation')).toBeNull();
  });
});
