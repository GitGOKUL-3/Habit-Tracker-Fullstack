
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header>
        <h1>User Management</h1>
        <p>Overview of all registered users and their progress.</p>
      </header>

      <div class="users-grid">
        <div class="card" *ngFor="let user of users">
          <div class="user-header">
            <div class="avatar">{{ user.avatar || '👤' }}</div>
            <div>
              <h3>{{ user.username }}</h3>
              <span class="email">{{ user.email }}</span>
            </div>
          </div>
          <div class="stats">
            <div class="stat" *ngIf="user.role !== 'admin'">
              <span class="label">Level</span>
              <span class="value">{{ user.level }}</span>
            </div>
            <div class="stat">
              <span class="label">Role</span>
              <span class="badg" [ngClass]="{'admin': user.role === 'admin'}">{{ user.role }}</span>
            </div>
          </div>
          <button (click)="viewActivity(user)" class="view-btn">View Activity</button>
        </div>
      </div>

      <div class="activity-modal" *ngIf="selectedUser">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Activity: {{ selectedUser.username }}</h2>
            <button (click)="closeActivity()" class="close-btn">&times;</button>
          </div>
          
          <div *ngIf="loadingActivity" class="loading">Loading...</div>
          
          <div *ngIf="!loadingActivity" class="activity-details">
            <h3>Habits ({{ userHabits.length }})</h3>
            <div class="habits-list">
              <div *ngFor="let habit of userHabits" class="habit-item">
                <span class="habit-name">{{ habit.name }}</span>
                <span class="streak">🔥 {{ habit.current_streak }}</span>
                <span class="freq">{{ habit.frequency }}</span>
              </div>
            </div>

            <h3 class="mt-4">Recent Logs</h3>
            <div class="logs-list">
              <div *ngFor="let log of userLogs" class="log-item" [ngClass]="log.status">
                <span class="date">{{ log.completion_date | date }}</span>
                <span class="habit">{{ log.habit_name }}</span>
                <span class="status">{{ log.status }}</span>
              </div>
              <p *ngIf="userLogs.length === 0">No recent activity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 0; }
    header { margin-bottom: 30px; }
    h1 { font-size: 2rem; margin-bottom: 10px; color: #1a202c; }
    p { color: #718096; }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.2s;
    }
    .card:hover { transform: translateY(-2px); }

    .user-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
    .avatar { font-size: 2rem; background: #e2e8f0; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .email { color: #718096; font-size: 0.9rem; }
    h3 { margin: 0; color: #2d3748; }

    .stats { display: flex; justify-content: space-between; margin-bottom: 20px; padding-top: 15px; border-top: 1px solid #edf2f7; }
    .stat { display: flex; flex-direction: column; }
    .label { font-size: 0.8rem; color: #718096; text-transform: uppercase; }
    .value { font-weight: bold; color: #2d3748; }
    
    .badg {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        background: #ebf8ff;
        color: #3182ce;
        text-transform: capitalize;
    }
    .badg.admin { background: #fffaf0; color: #d69e2e; }

    .view-btn {
      width: 100%;
      background: #1a2332;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .view-btn:hover { background: #2d3748; }

    /* Modal */
    .activity-modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      width: 600px;
      max-width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      border-radius: 12px;
      padding: 0; /* Removing padding from container to let header stick to edges */
      position: relative;
    }
    .modal-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 20px 30px;
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
        border-bottom: 1px solid #edf2f7;
    }
    .activity-details {
        padding: 30px;
    }
    .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; }
    
    .habit-item {
        display: flex; justify-content: space-between;
        padding: 10px; border-bottom: 1px solid #f0f0f0;
    }
    .streak { color: #ed8936; font-weight: bold; }

    .logs-list { margin-top: 10px; }
    .log-item {
        display: flex; justify-content: space-between;
        padding: 8px; background: #f7fafc; margin-bottom: 5px; border-radius: 4px;
        font-size: 0.9rem;
    }
    .log-item.completed { border-left: 4px solid #48bb78; }
    .log-item.skipped { border-left: 4px solid #e53e3e; }
    .mt-4 { margin-top: 20px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  userHabits: any[] = [];
  userLogs: any[] = [];
  loadingActivity = false;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error(err)
    });
  }

  viewActivity(user: any) {
    this.selectedUser = user;
    this.loadingActivity = true;
    this.adminService.getUserActivity(user.id).subscribe({
      next: (data) => {
        this.userHabits = data.habits;
        this.userLogs = data.logs;
        this.loadingActivity = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingActivity = false;
      }
    });
  }

  closeActivity() {
    this.selectedUser = null;
    this.userHabits = [];
    this.userLogs = [];
  }
}
