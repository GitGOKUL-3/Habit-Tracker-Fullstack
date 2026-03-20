import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Habit {
  id?: number;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom' | 'hourly';
  custom_days?: string;
  target_count?: number;
  user_id?: number;
  today_status?: string;
  log_id?: number;
  completions_today?: number;
  current_streak?: number;
  longest_streak?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = `${environment.apiUrl}/api/habits`;
  private refreshSubject = new Subject<void>();

  constructor(private http: HttpClient) { }

  get refresh$() {
    return this.refreshSubject.asObservable();
  }

  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.apiUrl);
  }

  getTodayHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}/today`);
  }

  getWeeklyActivity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activity`);
  }

  createHabit(habit: Habit): Observable<any> {
    return this.http.post(this.apiUrl, habit);
  }

  updateHabit(id: number, habit: Habit): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, habit);
  }

  deleteHabit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshSubject.next())
    );
  }

  logHabit(id: number, date: string, status: 'completed' | 'skipped' = 'completed', notes: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/log`, { date, status, notes }).pipe(
      tap(() => this.refreshSubject.next())
    );
  }

  getHabitLogs(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/logs`);
  }
}
