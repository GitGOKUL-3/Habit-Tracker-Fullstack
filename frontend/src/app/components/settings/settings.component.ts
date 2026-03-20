import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
    @Input() user: any;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    activeTab: 'profile' | 'appearance' | 'account' = 'profile';

    // Profile data
    username: string = '';
    bio: string = '';
    selectedAvatar: string = '👤';
    avatars: string[] = [
        '👤', '🐯', '🚀', '💀', '⭐', '🔥', '💻', '🎨', '🎵', '🎮',
        '🧘', '🚴', '📚', '⚡', '🤖', '👾', '🦊', '🦁', '🐶', '🐱'
    ];

    // Appearance data
    isDarkMode: boolean = false;

    // Account data
    currentPassword: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    passwordError: string = '';
    passwordSuccess: string = '';

    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private themeService: ThemeService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        // Init Profile
        if (this.user) {
            this.username = this.user.username;
            this.bio = this.user.bio || '';
            this.selectedAvatar = this.user.avatar || '👤';
        }

        // Init Theme
        this.isDarkMode = this.themeService.isDark();
    }

    // --- Navigation ---
    switchTab(tab: 'profile' | 'appearance' | 'account'): void {
        this.activeTab = tab;
        this.errorMessage = '';
        this.passwordError = '';
        this.passwordSuccess = '';
    }

    // --- Profile Methods ---
    selectAvatar(avatar: string): void {
        this.selectedAvatar = avatar;
    }

    profileSuccess: string = '';

    saveProfile(): void {
        if (!this.username.trim()) {
            this.errorMessage = 'Username is required';
            return;
        }
        this.isLoading = true;
        this.errorMessage = '';

        this.authService.updateProfile({
            username: this.username,
            bio: this.bio,
            avatar: this.selectedAvatar
        }).subscribe({
            next: () => {
                this.isLoading = false;
                this.saved.emit();
                this.toastService.show('Profile saved successfully! 🎉', 'success');
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to update profile';
            }
        });
    }

    // --- Appearance Methods ---
    toggleTheme(): void {
        this.themeService.toggleTheme();
        this.isDarkMode = this.themeService.isDark();
    }

    // --- Account Methods ---
    changePassword(): void {
        if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
            this.passwordError = 'All fields are required';
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.passwordError = 'New passwords do not match';
            return;
        }
        if (this.newPassword.length < 6) {
            this.passwordError = 'Password must be at least 6 characters';
            return;
        }

        this.isLoading = true;
        this.passwordError = '';
        this.passwordSuccess = '';

        // We need to implement changePassword in AuthService/Backend
        // For now, let's assume we will add it.
        this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
            next: () => {
                this.isLoading = false;
                this.toastService.show('Password changed successfully!', 'success');
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
            },
            error: (err) => {
                this.isLoading = false;
                this.passwordError = err.error?.message || 'Failed to change password';
            }
        });
    }

    onClose(): void {
        this.close.emit();
    }
}
