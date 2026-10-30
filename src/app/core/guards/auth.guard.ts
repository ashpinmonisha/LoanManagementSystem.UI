import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../features/login/login/login.service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isLoggedIn() && loginService.isAllowedRole(loginService.getEmployee()?.role)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};