
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoanApplication } from '../../core/models/loan.model';
import { LoginService } from '../login/login/login.service';
import { LoanApplicationService } from '../loan-application/loan-application/loan-application.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './Dashboard.css'
})
export class DashboardComponent implements OnInit {
  private readonly loans = inject(LoanApplicationService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  employee = this.loginService.getEmployee();
  applications: LoanApplication[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loans.getApplications().subscribe({
      next: data => {
        this.applications = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load loan applications.';
      }
    });
  }

  get pendingCount(): number {
    return this.applications.filter(
      x => x.status?.toLowerCase() === 'pending'
    ).length;
  }

  get approvedCount(): number {
    return this.applications.filter(
      x => x.status?.toLowerCase() === 'approved'
    ).length;
  }

  get rejectedCount(): number {
    return this.applications.filter(
      x => x.status?.toLowerCase() === 'rejected'
    ).length;
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
