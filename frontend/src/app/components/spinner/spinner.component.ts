import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="visible">
        <div class="dot-spinner">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </div>
  `,
  styles: [`
    /* Styles are already in global styles.css, but we can scope them if needed */
  `]
})
export class SpinnerComponent {
  @Input() visible: boolean = false;
}
