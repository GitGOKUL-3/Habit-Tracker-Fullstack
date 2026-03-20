
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="logo">
          <h2>🛡️ Admin</h2>
        </div>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/settings" routerLinkActive="active">Settings</a>
          <a (click)="logout()" class="logout">Logout</a>
        </nav>
      </aside>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f4f6f8;
      font-family: 'Inter', sans-serif;
    }
    .sidebar {
      width: 250px;
      background: #1a2332;
      color: #fff;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
    .logo h2 {
      margin: 0 0 40px 0;
      color: #ffd700; /* Gold */
      font-size: 1.5rem;
    }
    nav {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    nav a {
      color: #a0aec0;
      text-decoration: none;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    nav a:hover {
      background: #2d3748;
      color: #fff;
    }
    nav a.active {
      background: #2d3748;
      color: #ffd700;
      font-weight: bold;
      border-left: 4px solid #ffd700;
      padding-left: 11px; /* Adjust padding to account for border */
    }
    .logout {
      margin-top: auto;
      color: #fc8181;
    }
    .logout:hover {
      background: #c53030;
      color: white;
    }
    .content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
