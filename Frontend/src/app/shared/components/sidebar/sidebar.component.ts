import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="sidebar-container" [class.collapsed]="isCollapsed()">

      <!-- LOGO -->
      <div class="logo-section">
        <div class="logo-badge">
          <mat-icon>event_note</mat-icon>
        </div>
        <span class="logo-text" *ngIf="!isCollapsed()">WeeklyPlanner</span>
      </div>

      <!-- NAVIGATION -->
      <mat-nav-list class="nav-list">

        <div class="nav-label" *ngIf="!isCollapsed()">Main</div>

        <a mat-list-item
           routerLink="/dashboard"
           routerLinkActive="active-link"
           [routerLinkActiveOptions]="{exact: true}"
           [matTooltip]="isCollapsed() ? 'Dashboard' : ''"
           matTooltipPosition="right">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed()">Dashboard</span>
        </a>

        <a mat-list-item
           routerLink="/planning"
           routerLinkActive="active-link"
           *ngIf="authService.isTeamLead()"
           [matTooltip]="isCollapsed() ? 'Weekly Planning' : ''"
           matTooltipPosition="right">
          <mat-icon matListItemIcon>event_note</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed()">Weekly Plan</span>
        </a>

        <a mat-list-item
           routerLink="/backlog"
           routerLinkActive="active-link"
           [matTooltip]="isCollapsed() ? 'Backlog' : ''"
           matTooltipPosition="right">
          <mat-icon matListItemIcon>inventory_2</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed()">Product Backlog</span>
        </a>

        <a mat-list-item
           routerLink="/assignment"
           routerLinkActive="active-link"
           [matTooltip]="isCollapsed() ? 'My Assignments' : ''"
           matTooltipPosition="right">
          <mat-icon matListItemIcon>assignment_ind</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed()">Assignments</span>
        </a>

        <div class="nav-label" *ngIf="authService.isTeamLead() && !isCollapsed()">Admin</div>

        <a mat-list-item
           routerLink="/team"
           routerLinkActive="active-link"
           *ngIf="authService.isTeamLead()"
           [matTooltip]="isCollapsed() ? 'Team Management' : ''"
           matTooltipPosition="right">
          <mat-icon matListItemIcon>group_add</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed()">Team Members</span>
        </a>

        <a mat-list-item
           routerLink="/reports"
           routerLinkActive="active-link"
           [matTooltip]="isCollapsed() ? 'Reports' : ''"
           matTooltipPosition="right">
          <mat-icon matListItemIcon>analytics</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed()">Reports</span>
        </a>
      </mat-nav-list>

      <!-- COLLAPSE TOGGLE -->
      <div class="collapse-section">
        <button mat-icon-button (click)="toggleSidebar()" class="collapse-btn">
          <mat-icon>{{ isCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

    </div>
  `,
  styles: [`
    .sidebar-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #0f172a;
      color: #ffffff;
      padding: 24px 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 270px;
    }

    .sidebar-container.collapsed {
      width: 80px;
      padding: 24px 8px;
    }

    /* LOGO */
    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 12px;
      margin-bottom: 40px;
      overflow: hidden;
    }

    .logo-badge {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      min-width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
    }

    .logo-badge mat-icon {
      color: #ffffff !important;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #ffffff;
      white-space: nowrap;
    }

    /* LABEL */
    .nav-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin: 24px 12px 12px;
      white-space: nowrap;
    }

    /* NAV LIST */
    .nav-list {
      flex: 1;
      overflow-x: hidden;
    }

    a.mat-mdc-list-item {
      border-radius: 12px;
      margin: 4px 0;
      height: 48px !important;
      transition: all 0.2s ease;
      color: #cbd5e1 !important; /* Semi-transparent white for inactive */
    }

    a.mat-mdc-list-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff !important;
    }

    .active-link {
      background: #ffffff !important;
      color: #0f172a !important; /* Dark text on white background */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .active-link mat-icon, 
    .active-link [matListItemTitle] {
      color: #0f172a !important;
    }

    /* ICONS */
    mat-icon[matListItemIcon] {
      color: inherit !important;
      margin-right: 16px !important;
    }

    .collapsed mat-icon[matListItemIcon] {
      margin-right: 0 !important;
    }

    /* FOOTER / COLLAPSE */
    .collapse-section {
      padding: 12px;
      display: flex;
      justify-content: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      margin-top: 20px;
    }

    .collapse-btn {
      color: #64748b;
    }

    .collapse-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }

    a.mat-mdc-list-item .mdc-list-item__primary-text {
      color: #cbd5e1 !important;
    }

    a.mat-mdc-list-item:hover .mdc-list-item__primary-text {
      color: #ffffff !important;
    }

    .active-link .mdc-list-item__primary-text {
      color: #0f172a !important;
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  isCollapsed = signal(false);

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
