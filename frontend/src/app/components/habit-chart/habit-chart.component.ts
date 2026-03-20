import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../services/habit.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ChartSkeletonComponent } from '../chart-skeleton/chart-skeleton.component';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-habit-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, ChartSkeletonComponent],
  templateUrl: './habit-chart.component.html',
  styleUrl: './habit-chart.component.css'
})
export class HabitChartComponent implements OnInit {
  isLoading: boolean = true;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Habits Completed', backgroundColor: '#667eea', borderRadius: 5 }
    ]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '70%', // Makes it a donut
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [0, 1],
        backgroundColor: ['#4caf50', '#e0e0e0'],
        hoverBackgroundColor: ['#66bb6a', '#e0e0e0'],
        borderWidth: 0
      }
    ]
  };

  public todayProgress: number = 0;

  constructor(private habitService: HabitService) { }

  ngOnInit(): void {
    this.loadData();
    this.habitService.refresh$.subscribe(() => {
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      weekly: this.habitService.getWeeklyActivity(),
      daily: this.habitService.getTodayHabits()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ weekly, daily }) => {
        // 1. Weekly Activity
        this.barChartData = {
          labels: weekly.map(d => d.day),
          datasets: [{
            data: weekly.map(d => d.count),
            label: 'Habits Completed',
            backgroundColor: '#667eea',
            borderRadius: 5,
            hoverBackgroundColor: '#764ba2'
          }]
        };

        // 2. Today's Progress
        const completed = daily.filter(h => h.today_status === 'completed').length;
        const total = daily.length;
        const pending = total - completed;

        this.todayProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.doughnutChartData = {
          labels: ['Completed', 'Pending'],
          datasets: [{
            data: [completed, pending],
            backgroundColor: ['#4caf50', '#f5f5f5'],
            hoverBackgroundColor: ['#43a047', '#eeeeee'],
            borderWidth: 0
          }]
        };
      },
      error: (err) => console.error(err)
    });
  }
}


