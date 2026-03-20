import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSubject = new BehaviorSubject<string>('light');
    public theme$ = this.themeSubject.asObservable();

    constructor() {
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('app-theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme: string): void {
        this.themeSubject.next(theme);
        localStorage.setItem('app-theme', theme);

        // Apply class to body
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
    }

    toggleTheme(): void {
        const current = this.themeSubject.value;
        this.setTheme(current === 'light' ? 'dark' : 'light');
    }

    isDark(): boolean {
        return this.themeSubject.value === 'dark';
    }
}
