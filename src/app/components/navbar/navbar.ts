import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a class="brand" routerLink="/emi">
        <span class="brand-icon">₹</span>
        <span class="brand-text">
          <strong>Loan Management System</strong>
          <small>EMI &amp; Interest</small>
        </span>
      </a>

      <button class="menu-btn" (click)="toggle()" aria-label="Toggle menu">
        {{ open() ? '✕' : '☰' }}
      </button>

      <ul class="nav-links" [class.open]="open()">
        @for (l of links; track l.path) {
          <li>
            <a [routerLink]="l.path" routerLinkActive="active" (click)="close()">
              {{ l.label }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `
})
export class Navbar {
  readonly open = signal(false);

  readonly links = [
    { path: '/emi/calculate', label: '3.1 EMI' },
    { path: '/emi/interest', label: '3.2 Interest' },
    { path: '/emi/schedule', label: '3.3 Schedule' },
    { path: '/emi/amortization', label: 'Amortization' },
    { path: '/emi/prepayment', label: 'Prepayment' },
    { path: '/emi/comparison', label: 'Comparison' },
    { path: '/emi/summary', label: 'Summary' },
    { path: '/emi/history', label: 'History' }
  ];

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }
}