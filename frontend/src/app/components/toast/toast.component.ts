import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" class="toast" [ngClass]="toast.type">
        {{ toast.message }}
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none; /* Let clicks pass through */
    }

    .toast {
      background: white;
      color: #333;
      padding: 12px 24px;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-weight: 600;
      font-size: 0.95rem;
      animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Types */
    .toast.success {
      background: var(--bg-secondary, #fff);
      color: var(--success-color, #48bb78);
      border: 1px solid var(--success-color, #48bb78);
    }

    .toast.error {
      background: var(--bg-secondary, #fff);
      color: var(--danger-color, #f56565);
      border: 1px solid var(--danger-color, #f56565);
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `]
})
export class ToastComponent implements OnInit {
    toasts: Toast[] = [];

    constructor(private toastService: ToastService) { }

    ngOnInit(): void {
        this.toastService.toast$.subscribe(toast => {
            this.toasts.push(toast);
            setTimeout(() => this.remove(toast.id), 3000);
        });
    }

    remove(id: number): void {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }
}
