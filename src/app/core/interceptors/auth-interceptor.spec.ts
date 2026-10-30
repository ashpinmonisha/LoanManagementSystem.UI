import { TestBed } from '@angular/core/testing';
import { HttpContext, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoginService } from '../../features/login/login/login.service';
import { CustomerAuthService } from '../services/customer-auth';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const loginService = { getToken: vi.fn(() => 'employee-token'), logout: vi.fn() };
  const customerAuth = { getToken: vi.fn(() => 'customer-token'), logout: vi.fn() };
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    vi.clearAllMocks();
    loginService.getToken.mockReturnValue('employee-token');
    customerAuth.getToken.mockReturnValue('customer-token');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: LoginService, useValue: loginService },
        { provide: CustomerAuthService, useValue: customerAuth },
      ],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('uses the customer token for customer-portal payment requests', () => {
    let forwardedRequest: HttpRequest<unknown> | undefined;
    const request = new HttpRequest('GET', '/api/Payments/history/42', {
      context: new HttpContext().set(CUSTOMER_PORTAL_REQUEST, true),
    });

    interceptor(request, (forwarded) => {
      forwardedRequest = forwarded;
      return of(new HttpResponse());
    }).subscribe();

    expect(customerAuth.getToken).toHaveBeenCalledOnce();
    expect(forwardedRequest?.headers.get('Authorization')).toBe('Bearer customer-token');
    expect(loginService.getToken).not.toHaveBeenCalled();
  });

  it('keeps employee payment requests on the employee token', () => {
    let forwardedRequest: HttpRequest<unknown> | undefined;
    const request = new HttpRequest('GET', '/api/Payments/history/42');

    interceptor(request, (forwarded) => {
      forwardedRequest = forwarded;
      return of(new HttpResponse());
    }).subscribe();

    expect(loginService.getToken).toHaveBeenCalledOnce();
    expect(forwardedRequest?.headers.get('Authorization')).toBe('Bearer employee-token');
    expect(customerAuth.getToken).not.toHaveBeenCalled();
  });
});
