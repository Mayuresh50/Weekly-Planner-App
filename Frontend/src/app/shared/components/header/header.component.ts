import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar class="header-toolbar">
      <div class="breadcrumb-container">
        <span class="root-crumb">Weekly Planning</span>
        <mat-icon class="crumb-separator">chevron_right</mat-icon>
        <span class="active-crumb">Dashboard</span>
      </div>
      
      <span class="spacer"></span>
      
      <div class="actions">
        <button mat-icon-button (click)="themeService.toggleTheme()" aria-label="Toggle theme" class="action-btn">
          <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
        
        <div class="user-profile-trigger" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">
            {{ getInitials(authService.currentUser()?.name) }}
          </div>
          <div class="user-info hide-mobile">
            <div class="username">{{ authService.currentUser()?.name }}</div>
            <div class="userrole">{{ authService.currentUser()?.role }}</div>
          </div>
          <mat-icon class="expand-icon">expand_more</mat-icon>
        </div>
        
        <mat-menu #userMenu="matMenu" xPosition="before" class="enterprise-menu">
          <div class="menu-header">
            <div class="avatar-large">{{ getInitials(authService.currentUser()?.name) }}</div>
            <div class="header-details">
              <div class="name">{{ authService.currentUser()?.name }}</div>
              <div class="email">{{ authService.currentUser()?.email }}</div>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item>
            <mat-icon>person</mat-icon>
            <span>Profile Settings</span>
          </button>
          <button mat-menu-item (click)="authService.logout()" class="logout-item">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      color: #1e293b;
      height: 72px;
      padding: 0 24px;
      display: flex;
      align-items: center;
    }

    .breadcrumb-container {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .root-crumb {
      color: #64748b;
    }

    .crumb-separator {
      margin: 0 8px;
      font-size: 18px;
      color: #94a3b8;
    }

    .active-crumb {
      color: #0f172a;
      font-weight: 600;
    }

    .spacer { flex: 1 1 auto; }

    .actions { display: flex; align-items: center; gap: 16px; }

    .action-btn {
      color: #64748b;
    }

    .user-profile-trigger {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .user-profile-trigger:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .username {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .userrole {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: capitalize;
    }

    .expand-icon {
      font-size: 18px;
      color: #94a3b8;
    }

    .enterprise-menu {
      border-radius: 16px !important;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) !important;
    }

    .menu-header {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: #f8fafc;
    }

    .avatar-large {
      width: 48px;
      height: 48px;
      background: #3b82f6;
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .header-details .name {
      font-weight: 700;
      color: #0f172a;
    }

    .header-details .email {
      font-size: 0.8rem;
      color: #64748b;
    }

    .logout-item {
      color: #dc2626 !important;
    }

    @media (max-width: 640px) {
      .hide-mobile { display: none; }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
