import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitService } from '../../services/habit.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-habit-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-item.component.html',
  styleUrl: './habit-item.component.css'
})
export class HabitItemComponent implements OnInit {
  @Input() habit!: Habit;
  @Output() updated = new EventEmitter<void>();

  heatmapDays: { date: string, status: string }[] = [];

  constructor(private habitService: HabitService, private authService: AuthService) { }

  ngOnInit(): void {
    this.generateHeatmap();
  }

  generateHeatmap(): void {
    // We need logs to generate heatmap. 
    // Ideally, the parent should pass this or we fetch it. 
    // For now, fetching it here is the quickest path to "Always on UI".
    this.habitService.getHabitLogs(this.habit.id!).subscribe({
      next: (logs) => {
        this.heatmapDays = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];

          const log = logs.find((l: any) => {
            // Handle potential date format differences from DB
            const logDate = typeof l.completion_date === 'string' ? l.completion_date.split('T')[0] : new Date(l.completion_date).toISOString().split('T')[0];
            return logDate === dateStr;
          });

          this.heatmapDays.push({
            date: dateStr,
            status: log ? log.status : 'empty'
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  toggleComplete(): void {
    if (this.habit.frequency !== 'hourly' && this.habit.today_status === 'completed') {
      return;
    }

    // Strict cap: cannot exceed target_count
    if (this.habit.frequency === 'hourly' &&
      (this.habit.completions_today || 0) >= (this.habit.target_count || 1)) {
      return;
    }

    // OPTIMISTIC UPDATE
    const previousStatus = this.habit.today_status;
    const previousCompletions = this.habit.completions_today || 0;

    // Apply new state locally
    if (this.habit.frequency === 'hourly') {
      this.habit.completions_today = (this.habit.completions_today || 0) + 1;
      if (this.habit.completions_today >= (this.habit.target_count || 1)) {
        this.habit.today_status = 'completed';
      }
    } else {
      this.habit.today_status = 'completed';
    }

    const today = new Date().toISOString().split('T')[0];
    this.habitService.logHabit(this.habit.id!, today, 'completed').subscribe({
      next: (res: any) => {
        if (res.level) {
          this.authService.updateUserStats({
            level: res.level,
            current_xp: res.total_xp
          });
        }
        this.updated.emit();
        this.generateHeatmap(); // Refresh heatmap
      },
      error: (err) => {
        console.error(err);
        // REVERT OPTIMISTIC UPDATE
        this.habit.today_status = previousStatus;
        this.habit.completions_today = previousCompletions;
      }
    });
  }

  showDeleteConfirm = false;

  initiateDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  deleteHabit(): void {
    this.habitService.deleteHabit(this.habit.id!).subscribe({
      next: (res: any) => {
        if (res.level) {
          this.authService.updateUserStats({
            level: res.level,
            current_xp: res.xp
          });
        }
        this.updated.emit();
      },
      error: (err) => console.error(err)
    });
  }
}
