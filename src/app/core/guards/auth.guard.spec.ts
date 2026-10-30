import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../../features/login/login/login.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const loginServiceMock = {
    isLoggedIn: vi.fn(),
    getEmployee: vi.fn(),
    isAllowedRole: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: LoginService, useValue: loginServiceMock }],
    });
  });

  const executeGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  it('allows a logged-in user with an allowed role', () => {
    loginServiceMock.isLoggedIn.mockReturnValue(true);
    loginServiceMock.getEmployee.mockReturnValue({ role: 'Admin' });
    loginServiceMock.isAllowedRole.mockReturnValue(true);

    expect(executeGuard()).toBe(true);
  });

  it('redirects a logged-in user with a disallowed role', () => {
    loginServiceMock.isLoggedIn.mockReturnValue(true);
    loginServiceMock.getEmployee.mockReturnValue({ role: 'Customer' });
    loginServiceMock.isAllowedRole.mockReturnValue(false);

    const result = executeGuard();
    const router = TestBed.inject(Router);

    expect(result).toEqual(router.parseUrl('/login'));
  });
});
