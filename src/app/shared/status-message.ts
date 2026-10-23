import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-message',
  template: `
    @if (loading()) {
      <p class="muted">Calculating...</p>
    }
    @if (error(); as messages) {
      <div class="alert error">
        <ul>
          @for (m of messages; track $index) {
            <li>{{ m }}</li>
          }
        </ul>
      </div>
    }
  `
})
export class StatusMessage {
  readonly loading = input(false);
  readonly error = input<string[] | null>(null);
}