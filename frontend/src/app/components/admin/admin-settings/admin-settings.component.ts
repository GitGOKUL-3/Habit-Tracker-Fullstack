
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    template: `
    <div class="settings-container">
      <header>
        <h1>Admin Settings</h1>
        <p>Manage your account and preferences.</p>
      </header>

      <div class="settings-grid">
        <!-- Profile Section -->
        <div class="card">
          <h2>Profile Information</h2>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="form-group">
              <label>Username</label>
              <input type="text" formControlName="username">
            </div>
            
            <div class="form-group">
              <label>Avatar (Emoji)</label>
              <input type="text" formControlName="avatar" maxlength="2">
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" [value]="currentUser?.email" disabled class="disabled-input">
              <small>Email cannot be changed.</small>
            </div>

            <button type="submit" [disabled]="!profileForm.valid || loadingProfile" class="btn-primary">
              {{ loadingProfile ? 'Saving...' : 'Update Profile' }}
            </button>
            <p *ngIf="profileMessage" [class.success]="profileSuccess" [class.error]="!profileSuccess" class="msg">{{ profileMessage }}</p>
          </form>
        </div>

        <!-- Password Section -->
        <div class="card">
          <h2>Change Password</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" formControlName="oldPassword">
            </div>

            <div class="form-group">
              <label>New Password</label>
              <input type="password" formControlName="newPassword">
            </div>

            <button type="submit" [disabled]="!passwordForm.valid || loadingPassword" class="btn-secondary">
              {{ loadingPassword ? 'Updating...' : 'Change Password' }}
            </button>
             <p *ngIf="passwordMessage" [class.success]="passwordSuccess" [class.error]="!passwordSuccess" class="msg">{{ passwordMessage }}</p>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .settings-container { padding: 0; }
    header { margin-bottom: 30px; }
    h1 { font-size: 2rem; margin-bottom: 10px; color: #1a202c; }
    p { color: #718096; }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    h2 { margin-top: 0; margin-bottom: 20px; font-size: 1.2rem; color: #2d3748; border-bottom: 1px solid #edf2f7; padding-bottom: 15px; }

    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500; font-size: 0.9rem; }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: #3182ce; }
    .disabled-input { background-color: #f7fafc; color: #a0aec0; cursor: not-allowed; }
    small { color: #a0aec0; font-size: 0.8rem; }

    button {
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }
    .btn-primary { background: #3182ce; color: white; }
    .btn-primary:hover { background: #2b6cb0; }
    .btn-primary:disabled { background: #bee3f8; cursor: default; }

    .btn-secondary { background: #4a5568; color: white; }
    .btn-secondary:hover { background: #2d3748; }
    .btn-secondary:disabled { background: #e2e8f0; cursor: default; }

    .msg { margin-top: 15px; font-size: 0.9rem; }
    .success { color: #48bb78; }
    .error { color: #f56565; }
  `]
})
export class AdminSettingsComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    currentUser: any;

    loadingProfile = false;
    profileMessage = '';
    profileSuccess = false;

    loadingPassword = false;
    passwordMessage = '';
    passwordSuccess = false;

    failedAttempts = 0;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastService: ToastService,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            username: ['', Validators.required],
            avatar: ['']
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser) {
            this.profileForm.patchValue({
                username: this.currentUser.username,
                avatar: this.currentUser.avatar
            });
        }
    }

    updateProfile() {
        if (this.profileForm.invalid) return;

        this.loadingProfile = true;
        this.profileMessage = '';

        this.authService.updateProfile(this.profileForm.value).subscribe({
            next: (res) => {
                this.loadingProfile = false;
                this.profileSuccess = true;
                this.profileMessage = 'Profile updated successfully!';
                this.toastService.show('Profile updated successfully!', 'success');
                this.currentUser = this.authService.getCurrentUser(); // Refresh local user
            },
            error: (err) => {
                this.loadingProfile = false;
                this.profileSuccess = false;
                const msg = err.error.message || 'Update failed';
                this.profileMessage = msg;
                this.toastService.show(msg, 'error');
            }
        });
    }

    changePassword() {
        if (this.passwordForm.invalid) return;

        this.loadingPassword = true;
        this.passwordMessage = '';

        const { oldPassword, newPassword } = this.passwordForm.value;

        this.authService.changePassword(oldPassword, newPassword).subscribe({
            next: (res) => {
                this.loadingPassword = false;
                this.passwordSuccess = true;
                this.passwordMessage = 'Password changed successfully!';
                this.toastService.show('Password changed successfully!', 'success');
                this.passwordForm.reset();
                this.failedAttempts = 0; // Reset attempts on success
            },
            error: (err) => {
                this.loadingPassword = false;
                this.passwordSuccess = false;
                const msg = err.error.message || 'Change failed';
                this.passwordMessage = msg;

                if (msg.includes('Incorrect old password')) {
                    this.failedAttempts++;
                    const remaining = 3 - this.failedAttempts;

                    if (this.failedAttempts >= 3) {
                        this.toastService.show('Too many failed attempts. Logging out...', 'error');
                        setTimeout(() => {
                            this.authService.logout();
                            // Router redirect happens in authService or we can force it here
                            // this.router.navigate(['/admin/login']);
                        }, 2000);
                    } else {
                        this.toastService.show(`Incorrect old password. ${remaining} attempts remaining.`, 'error');
                    }
                } else {
                    this.toastService.show(msg, 'error');
                }
            }
        });
    }
}
