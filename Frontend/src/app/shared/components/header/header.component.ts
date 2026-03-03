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
      <button mat-icon-button class="hide-desktop">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="spacer"></span>
      
      <div class="actions">
        <button mat-icon-button (click)="themeService.toggleTheme()" aria-label="Toggle theme">
          <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
        
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
          <mat-icon>account_circle</mat-icon>
          <span class="username">{{ authService.currentUser()?.name }}</span>
          <mat-icon>expand_more</mat-icon>
        </button>
        
        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="menu-header">
            <div class="name">{{ authService.currentUser()?.name }}</div>
            <div class="role">{{ authService.currentUser()?.role }}</div>
          </div>
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
    .header-toolbar {
      background: var(--header-bg);
      border-bottom: 1px solid var(--surface-border);
      color: var(--text-color);
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 16px;
    }
    .spacer { flex: 1 1 auto; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: none;
      font-weight: 500;
    }
    .username { margin: 0 4px; }
    .menu-header { padding: 16px; min-width: 200px; }
    .menu-header .name { font-weight: 600; color: var(--text-color); }
    .menu-header .role { font-size: 0.75rem; color: var(--text-secondary); }
    
    @media (min-width: 769px) {
      .hide-desktop { display: none; }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
}
