import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth';

export const customerGuard: CanActivateFn = () => {
  const customerAuth = inject(CustomerAuthService);
  const router = inject(Router);

  return customerAuth.isLoggedIn() ? true : router.createUrlTree(['/customer/login']);
};
