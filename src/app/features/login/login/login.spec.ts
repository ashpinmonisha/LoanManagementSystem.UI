import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login';
import { LoginService } from './login.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const loginServiceMock = {
    login: vi.fn(),
    logout: vi.fn(),
    isAllowedRole: vi.fn((role: string | undefined) =>
      ['admin', 'manager', 'employee'].includes(role?.trim().toLowerCase() ?? ''),
    ),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: LoginService,
          useValue: loginServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows an authorized role to continue to the dashboard', async () => {
    loginServiceMock.login.mockReturnValue(of({ employee: { role: 'Manager' } }));
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.employeeCode = 'E001';
    component.password = 'password';
    component.submitLogin();
    await fixture.whenStable();

    expect(loginServiceMock.isAllowedRole).toHaveBeenCalledWith('Manager');
    expect(loginServiceMock.logout).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('rejects a role outside the allowlist', () => {
    loginServiceMock.login.mockReturnValue(of({ employee: { role: 'Customer' } }));

    component.employeeCode = 'E001';
    component.password = 'password';
    component.submitLogin();

    expect(loginServiceMock.logout).toHaveBeenCalledOnce();
    expect(component.errorMessage).toBe('Your account does not have access.');
  });
});
