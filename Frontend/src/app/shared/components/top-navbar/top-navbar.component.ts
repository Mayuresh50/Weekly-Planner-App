import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatSlideToggleModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="main-navbar">
      <div class="navbar-brand" (click)="goToDashboard()">
        <mat-icon class="brand-icon">event_note</mat-icon>
        <span class="brand-name">Weekly Plan Tracker</span>
      </div>

      <span class="spacer"></span>

      <div class="navbar-actions">
        <button mat-icon-button (click)="toggleDarkMode()" matTooltip="Toggle Dark Mode">
          <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <div class="user-profile" [matMenuTriggerFor]="userMenu">
          <div class="user-info">
            <span class="username">{{ authService.currentUser()?.name }}</span>
            <span class="role-text">{{ authService.currentUser()?.role }}</span>
          </div>
          <div class="avatar">
            {{ getInitials(authService.currentUser()?.name) }}
          </div>
        </div>

        <mat-menu #userMenu="matMenu" xPosition="before" class="modern-menu">
          // <button mat-menu-item (click)="authService.toggleRole()">
          //   <mat-icon>sync_alt</mat-icon>
          //   <span>Switch to {{ authService.isTeamLead() ? 'Team Member' : 'Team Lead' }}</span>
          // </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .main-navbar {
      background: white;
      color: #0f172a;
      height: 72px;
      padding: 0 32px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      user-select: none;
    }

    .brand-icon {
      color: #3b82f6;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #0f172a;
    }

    .spacer { flex: 1 1 auto; }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 6px 6px 16px;
      background: #f8fafc;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #f1f5f9;
    }

    .user-profile:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .username {
      font-size: 0.875rem;
      font-weight: 700;
      color: #1e293b;
    }

    .role-text {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .modern-menu {
      border-radius: 12px;
      overflow: hidden;
      margin-top: 8px;
    }

    @media (max-width: 640px) {
      .brand-name, .user-info { display: none; }
      .main-navbar { padding: 0 16px; }
    }
  `]
})
export class TopNavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isDarkMode = false;

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    // In a real app, logic to switch CSS classes or themes would go here
  }

  getInitials(name?: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
