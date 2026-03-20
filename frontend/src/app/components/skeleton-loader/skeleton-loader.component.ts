import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="skeleton-container" *ngIf="visible">
      <!-- Create multiple skeleton items to mimic a list -->
      <div class="skeleton-card" *ngFor="let item of [1, 2, 3]">
        <div class="skeleton-main">
          <div class="skeleton-info">
            <div class="skeleton-bone title-bone"></div>
            <div class="skeleton-bone desc-bone"></div>
            <div class="skeleton-bone badge-bone"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-bone btn-bone"></div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 15px; /* Matches habit list gap */
      width: 100%;
    }

    .skeleton-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      border-left: 5px solid #eee; /* Light gray border instead of transparent */
      animation: pulse 1.5s infinite ease-in-out;
    }

    .skeleton-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .skeleton-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 70%;
    }

    .skeleton-actions {
       width: 20%;
       display: flex;
       justify-content: flex-end;
    }

    /* Bones */
    .skeleton-bone {
      background: #e0e0e0;
      border-radius: 4px;
    }

    .title-bone {
      height: 20px;
      width: 60%;
    }

    .desc-bone {
      height: 14px;
      width: 80%;
    }

    .badge-bone {
      height: 16px;
      width: 40px;
      margin-top: 4px;
      border-radius: 12px;
    }

    .btn-bone {
      width: 60px;
      height: 35px;
      border-radius: 4px;
    }

    /* Dark Mode Support */
    :host-context(body.dark-theme) .skeleton-card {
      background: #1e293b;
      border-left-color: #334155;
    }
    
    :host-context(body.dark-theme) .skeleton-bone {
        background: #334155;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class SkeletonLoaderComponent {
    @Input() visible: boolean = false;
}
