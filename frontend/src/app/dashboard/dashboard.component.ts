import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitListComponent } from '../components/habit-list/habit-list.component';
import { AddHabitComponent } from '../components/add-habit/add-habit.component';
import { HabitChartComponent } from '../components/habit-chart/habit-chart.component';
import { AuthService } from '../services/auth.service';
import { HabitService, Habit } from '../services/habit.service';
import { SettingsComponent } from '../components/settings/settings.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HabitListComponent, AddHabitComponent, HabitChartComponent, SettingsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any;
  showAddModal: boolean = false;
  activeTab: 'habits' | 'progress' = 'habits';
  @ViewChild(HabitListComponent) habitList?: HabitListComponent;

  // Profile Menu State
  showProfileMenu: boolean = false;

  constructor(private authService: AuthService, private habitService: HabitService) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.setDailyQuote();
    // Close profile menu when clicking outside (simple implementation: click anywhere else)
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.profile-section')) {
        this.showProfileMenu = false;
      }
    });
  }

  quote: string = '';

  setDailyQuote(): void {
    const quotes = [
      "Success is the sum of small efforts, repeated day in and day out.",
      "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      "The secret of your future is hidden in your daily routine.",
      "Don't watch the clock; do what it does. Keep going.",
      "It's not about being the best. It's about being better than you were yesterday."
    ];
    const index = new Date().getDate() % quotes.length;
    this.quote = quotes[index];
  }

  logout(): void {
    this.authService.logout();
  }

  toggleAddModal(): void {
    this.showAddModal = !this.showAddModal;
  }

  switchTab(tab: 'habits' | 'progress'): void {
    this.activeTab = tab;
  }

  onHabitAdded(): void {
    if (this.habitList) {
      this.habitList.loadHabits();
    }
    this.toggleAddModal();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  showSettings: boolean = false;

  openSettings(): void {
    this.showSettings = true;
    this.showProfileMenu = false; // Close menu
  }

  closeSettings(): void {
    this.showSettings = false;
  }

  onSettingsSaved(): void {
    // User data is updated in AuthService, which updates local storage and behavior subject.
    this.closeSettings();
  }
}
