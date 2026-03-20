import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-chart-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="charts-skeleton-grid">
      <!-- Doughnut Skeleton -->
      <div class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="doughnut-skeleton">
            <div class="inner-circle"></div>
        </div>
      </div>

      <!-- Bar Skeleton -->
      <div class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="bar-skeleton-container">
            <div class="bar-bone" style="height: 40%"></div>
            <div class="bar-bone" style="height: 70%"></div>
            <div class="bar-bone" style="height: 50%"></div>
            <div class="bar-bone" style="height: 90%"></div>
            <div class="bar-bone" style="height: 30%"></div>
            <div class="bar-bone" style="height: 60%"></div>
            <div class="bar-bone" style="height: 80%"></div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .charts-skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      width: 100%;
    }

    .skeleton-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 300px; /* Match typical chart height */
      justify-content: center;
      animation: pulse 1.5s infinite ease-in-out;
    }

    .skeleton-title {
        width: 150px;
        height: 24px;
        background: #e0e0e0;
        border-radius: 4px;
        margin-bottom: 20px;
        align-self: flex-start;
    }

    /* Doughnut Specifics */
    .doughnut-skeleton {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: #e0e0e0;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .inner-circle {
        width: 70%;
        height: 70%;
        background: white; /* Match card bg */
        border-radius: 50%;
    }

    /* Bar Specifics */
    .bar-skeleton-container {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        width: 100%;
        height: 150px; /* Available chart height */
        padding: 0 10px;
    }

    .bar-bone {
        width: 10%; /* rough width per bar */
        background: #e0e0e0;
        border-radius: 4px 4px 0 0;
    }

    /* Dark Mode Support */
    :host-context(body.dark-theme) .skeleton-card {
      background: #1e293b;
    }

    :host-context(body.dark-theme) .skeleton-title,
    :host-context(body.dark-theme) .doughnut-skeleton,
    :host-context(body.dark-theme) .bar-bone {
        background: #334155;
    }

    :host-context(body.dark-theme) .inner-circle {
        background: #1e293b;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class ChartSkeletonComponent { }
