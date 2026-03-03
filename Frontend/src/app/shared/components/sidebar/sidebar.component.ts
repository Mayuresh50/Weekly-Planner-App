import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule
  ],
  template: `
    <div class="sidebar-container">

      <!-- LOGO -->
      <div class="logo-section">
        <div class="logo-badge">
          <mat-icon>event_note</mat-icon>
        </div>
        <span class="logo-text">WeeklyPlanner</span>
      </div>

      <!-- NAVIGATION -->
      <mat-nav-list class="nav-list">

        <div class="nav-label">Main</div>

        <a mat-list-item
           routerLink="/dashboard"
           routerLinkActive="active-link"
           [routerLinkActiveOptions]="{exact: true}">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>

        <a mat-list-item
           routerLink="/backlog"
           routerLinkActive="active-link">
          <mat-icon matListItemIcon>format_list_bulleted</mat-icon>
          <span matListItemTitle>Backlog</span>
        </a>

        <div class="nav-label" *ngIf="authService.isTeamLead()">Planning</div>

        <a mat-list-item
           *ngIf="authService.isTeamLead()"
           routerLink="/planning"
           routerLinkActive="active-link">
          <mat-icon matListItemIcon>assignment</mat-icon>
          <span matListItemTitle>Team Planning</span>
        </a>

        <a mat-list-item
           routerLink="/assignment"
           routerLinkActive="active-link">
          <mat-icon matListItemIcon>person_add</mat-icon>
          <span matListItemTitle>My Assignments</span>
        </a>

      </mat-nav-list>

      <!-- FOOTER -->
      <div class="footer-section">
        <button mat-list-item class="logout-btn" (click)="logout()">
          <mat-icon matListItemIcon>logout</mat-icon>
          <span matListItemTitle>Logout</span>
        </button>
      </div>

    </div>
  `,
  styles: [`

  .sidebar-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #0f172a, #0b1220);
    color: #ffffff;
    padding: 16px 12px;
  }

  /* LOGO */
  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    margin-bottom: 10px;
  }

  .logo-badge {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
  }

  .logo-badge mat-icon {
    color: #ffffff !important;
  }

  .logo-text {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  /* LABEL */
  .nav-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.6);
    margin: 16px 12px 6px;
  }

  /* NAV LIST */
  .nav-list {
    flex: 1;
  }

  /* FORCE MATERIAL TEXT COLOR */
  a.mat-mdc-list-item,
  button.mat-mdc-list-item {
    border-radius: 14px;
    margin: 4px 8px;
    transition: all 0.25s ease;
    color: #f1f5f9 !important;
  }

  /* Primary Text Override */
  a.mat-mdc-list-item .mdc-list-item__primary-text,
  button.mat-mdc-list-item .mdc-list-item__primary-text {
    color: #f1f5f9 !important;
    font-weight: 500;
  }

  /* ICON */
  a.mat-mdc-list-item mat-icon,
  button.mat-mdc-list-item mat-icon {
    color: rgba(255,255,255,0.75) !important;
    transition: 0.25s ease;
  }

  /* HOVER */
  a.mat-mdc-list-item:hover,
  button.mat-mdc-list-item:hover {
    background: rgba(255,255,255,0.08);
    transform: translateX(4px);
  }

  a.mat-mdc-list-item:hover mat-icon,
  button.mat-mdc-list-item:hover mat-icon {
    color: #ffffff !important;
  }

  /* ACTIVE */
  .active-link {
    background: linear-gradient(90deg, #3b82f6, #2563eb) !important;
    box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
  }

  .active-link .mdc-list-item__primary-text {
    color: #ffffff !important;
    font-weight: 600;
  }

  .active-link mat-icon {
    color: #ffffff !important;
  }

  /* FOOTER */
  .footer-section {
    padding: 8px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .logout-btn {
    border-radius: 14px;
    margin: 6px 8px;
    color: #f1f5f9 !important;
    transition: all 0.25s ease;
  }

  .logout-btn:hover {
    background: rgba(239,68,68,0.15);
    color: #ef4444 !important;
  }

`]
})
export class SidebarComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}