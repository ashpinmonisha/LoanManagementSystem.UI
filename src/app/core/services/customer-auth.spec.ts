import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CustomerAuthService } from './customer-auth';

describe('CustomerAuthService', () => {
  let service: CustomerAuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomerAuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('registers against the customer API', () => {
    service
      .register({
        fullName: 'Akash Customer',
        email: 'akash@example.com',
        phoneNumber: '9876543210',
        password: 'password123',
        confirmPassword: 'password123',
        dateOfBirth: null,
        gender: null,
      })
      .subscribe((response) => expect(response.customerId).toBe(12));

    const request = http.expectOne('/api/Customer/register');
    expect(request.request.method).toBe('POST');
    request.flush({
      message: 'Customer registered successfully.',
      customerId: 12,
      fullName: 'Akash Customer',
      email: 'akash@example.com',
      phoneNumber: '9876543210',
    });
  });

  it('stores customer session and detects an expired token', () => {
    const token = (expiration: number) =>
      `header.${btoa(JSON.stringify({ exp: expiration }))}.signature`;
    const customer = {
      customerId: 12,
      fullName: 'Akash Customer',
      email: 'akash@example.com',
      token: token(Math.floor(Date.now() / 1000) + 60),
    };

    service.login({ email: customer.email, password: 'password123' }).subscribe();
    http.expectOne('/api/Customer/login').flush(customer);

    expect(service.getCustomer()).toEqual(customer);
    expect(service.isLoggedIn()).toBe(true);

    sessionStorage.setItem(
      'customer',
      JSON.stringify({ ...customer, token: token(Math.floor(Date.now() / 1000) - 60) }),
    );
    expect(service.isLoggedIn()).toBe(false);
    service.logout();
    expect(service.getCustomer()).toBeNull();
  });
});
