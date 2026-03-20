import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService, Habit } from '../../services/habit.service';
import { HabitItemComponent } from '../habit-item/habit-item.component';
import { ToastService } from '../../services/toast.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, HabitItemComponent, SkeletonLoaderComponent],
  templateUrl: './habit-list.component.html',
  styleUrl: './habit-list.component.css'
})
export class HabitListComponent implements OnInit {
  habits: Habit[] = [];
  isLoading: boolean = false;

  constructor(
    private habitService: HabitService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }
    this.habitService.getTodayHabits().subscribe({
      next: (data) => {
        this.habits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Failed to load habits', 'error');
        this.isLoading = false;
      }
    });
  }

  onHabitUpdated(): void {
    this.loadHabits(false);
  }

  trackByHabitId(index: number, habit: Habit): number {
    return habit.id!;
  }
}
