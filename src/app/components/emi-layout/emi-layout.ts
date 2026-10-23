import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-emi-layout',
  imports: [RouterOutlet, Navbar],
  template: `
    <div class="emi">
      <app-navbar />
      <main class="container">
        <router-outlet />
      </main>
    </div>
  `
})
export class EmiLayout {}