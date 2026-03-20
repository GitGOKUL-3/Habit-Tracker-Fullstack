import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-settings.component.html',
    styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent implements OnInit {
    @Input() user: any;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    username: string = '';
    bio: string = '';
    selectedAvatar: string = '👤';

    // Emoji presets
    avatars: string[] = [
        '👤', '🐯', '🚀', '💀', '⭐', '🔥', '💻', '🎨', '🎵', '🎮',
        '🧘', '🚴', '📚', '⚡', '🤖', '👾', '🦊', '🦁', '🐶', '🐱'
    ];

    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        if (this.user) {
            this.username = this.user.username;
            this.bio = this.user.bio || '';
            this.selectedAvatar = this.user.avatar || '👤';
        }
    }

    selectAvatar(avatar: string): void {
        this.selectedAvatar = avatar;
    }

    save(): void {
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
                this.close.emit();
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to update profile';
            }
        });
    }

    cancel(): void {
        this.close.emit();
    }
}
