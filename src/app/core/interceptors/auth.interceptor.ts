import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../../features/login/login/login.service';
import { CustomerAuthService } from '../services/customer-auth';
import { CUSTOMER_PORTAL_REQUEST } from '../customer-portal-request';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const customerAuth = inject(CustomerAuthService);
  const router = inject(Router);

  const customerPortalRequest = req.context.get(CUSTOMER_PORTAL_REQUEST);
  const customerRequest =
    customerPortalRequest || /\/api\/(customer|kycdocument|customereligibility)(\/|$)/i.test(req.url);
  const token = customerRequest ? customerAuth.getToken() : loginService.getToken();

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthenticationRequest = /\/(login|register)$/i.test(req.url);
      if (error.status === 401 && !isAuthenticationRequest) {
        if (customerRequest) {
          customerAuth.logout();
          void router.navigate(['/customer/login']);
        } else {
          loginService.logout();
          void router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
