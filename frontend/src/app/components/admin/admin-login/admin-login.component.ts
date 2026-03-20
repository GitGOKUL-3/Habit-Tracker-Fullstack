
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    template: `
    <div class="admin-login-container">
      <div class="login-box">
        <div class="header">
          <h2>🛡️ Admin Portal</h2>
          <p>Restricted Access</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" formControlName="email" placeholder="admin@example.com">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="!loginForm.valid || isLoading">
            {{ isLoading ? 'Authenticating...' : 'Access Dashboard' }}
          </button>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .admin-login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #1a202c;
      color: #e2e8f0;
      font-family: 'Inter', sans-serif;
    }

    .login-box {
      background: #2d3748;
      padding: 40px;
      border-radius: 12px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
      border: 1px solid #4a5568;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    h2 {
      margin: 0;
      color: #ffd700;
      font-size: 1.8rem;
    }

    p {
      margin-top: 5px;
      color: #a0aec0;
      font-size: 0.9rem;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #cbd5e0;
    }

    input {
      width: 100%;
      padding: 12px;
      background: #1a202c;
      border: 1px solid #4a5568;
      border-radius: 6px;
      color: white;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #ffd700;
    }

    button {
      width: 100%;
      padding: 12px;
      background: #ffd700;
      color: #1a202c;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 10px;
      transition: transform 0.1s;
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px);
      background: #ecc94b;
    }

    button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error-msg {
      background: #742a2a;
      color: #feb2b2;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 0.9rem;
      text-align: center;
    }
  `]
})
export class AdminLoginComponent {
    loginForm: FormGroup;
    errorMessage: string = '';
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            this.authService.login(this.loginForm.value).subscribe({
                next: (data) => {
                    this.isLoading = false;
                    if (data.role === 'admin') {
                        this.router.navigate(['/admin/dashboard']);
                    } else {
                        // If a normal user tries to login here
                        this.errorMessage = 'Access Denied: Authorized Personnel Only.';
                        this.authService.logout(); // Clear the session immediately
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Invalid credentials';
                }
            });
        }
    }
}
