import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-habit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-habit.component.html',
  styleUrl: './add-habit.component.css'
})
export class AddHabitComponent {
  habitForm: FormGroup;
  @Output() habitAdded = new EventEmitter<void>();

  days = [
    { name: 'Sun', value: 0 },
    { name: 'Mon', value: 1 },
    { name: 'Tue', value: 2 },
    { name: 'Wed', value: 3 },
    { name: 'Thu', value: 4 },
    { name: 'Fri', value: 5 },
    { name: 'Sat', value: 6 }
  ];

  selectedDays: number[] = [];

  constructor(
    private fb: FormBuilder,
    private habitService: HabitService,
    private toastService: ToastService
  ) {
    this.habitForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      frequency: ['daily', Validators.required],
      target_count: [1, [Validators.min(1)]]
    });
  }

  toggleDay(value: number): void {
    const index = this.selectedDays.indexOf(value);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(value);
    }
    this.selectedDays.sort();
  }

  onSubmit(): void {
    if (this.habitForm.valid) {
      const habitData = {
        ...this.habitForm.value,
        custom_days: this.habitForm.value.frequency === 'custom' ? this.selectedDays.join(',') : null
      };

      this.habitService.createHabit(habitData).subscribe({
        next: () => {
          this.habitForm.reset({ frequency: 'daily' });
          this.selectedDays = [];
          this.habitAdded.emit();
          this.toastService.show('Habit created successfully! 🌱', 'success');
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Failed to create habit', 'error');
        }
      });
    } else {
      this.toastService.show('Please fill in all required fields', 'error');
    }
  }
}
