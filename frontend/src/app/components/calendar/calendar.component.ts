import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnChanges {
  @Input() logs: any[] = [];

  currentDate: Date = new Date();
  daysInMonth: number[] = [];
  paddingDays: number[] = [];
  monthName: string = '';
  year: number = 0;

  // Track completed dates for quick lookup
  completedDates: Set<string> = new Set();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logs']) {
      this.updateCompletedDates();
    }
    this.generateCalendar();
  }

  updateCompletedDates() {
    this.completedDates.clear();
    this.logs.forEach(log => {
      if (log.status === 'completed') {
        // Ensure standard format YYYY-MM-DD
        const dateStr = new Date(log.completion_date).toISOString().split('T')[0];
        this.completedDates.add(dateStr);
      }
    });
    this.generateCalendar(); // Refreshes view in case logs loaded after init
  }

  generateCalendar() {
    this.year = this.currentDate.getFullYear();
    const monthIndex = this.currentDate.getMonth(); // 0-11
    this.monthName = this.currentDate.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(this.year, monthIndex, 1);
    const lastDayOfMonth = new Date(this.year, monthIndex + 1, 0);

    const daysCount = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

    this.daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1);
    this.paddingDays = Array.from({ length: startDay }, (_, i) => i);
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  isCompleted(day: number): boolean {
    const month = (this.currentDate.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const dateStr = `${this.year}-${month}-${d}`;
    return this.completedDates.has(dateStr);
  }
}
