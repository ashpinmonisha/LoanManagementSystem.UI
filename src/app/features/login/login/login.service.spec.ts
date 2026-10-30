import { TestBed } from '@angular/core/testing';
import { LoginService } from './login.service';

describe('LoginService', () => {
  let service: LoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each(['Admin', 'Manager', 'Employee', ' manager '])(
    'allows the %s role',
    (role) => {
      expect(service.isAllowedRole(role)).toBe(true);
    },
  );

  it.each(['Customer', '', 'unknown'])('rejects the %s role', (role) => {
    expect(service.isAllowedRole(role)).toBe(false);
  });

  it('rejects a missing role', () => {
    expect(service.isAllowedRole(undefined)).toBe(false);
  });
});
