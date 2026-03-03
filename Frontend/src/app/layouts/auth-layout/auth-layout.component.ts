import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
             <span class="logo-icon material-icons">event_note</span>
             <h1 class="logo-text">WeeklyPlanner</h1>
          </div>
          <p class="subtitle">Enterprise Resource Planning</p>
        </div>
        
        <div class="auth-content">
          <router-outlet></router-outlet>
        </div>
        
        <div class="auth-footer">
          &copy; 2026 ThinkBridge Weekly Planner
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2b6cb0 0%, #2d3748 100%);
      padding: 16px;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: var(--surface-card);
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      animation: fadeIn 0.5s ease-out;
    }
    .auth-header {
      padding: 40px 40px 20px;
      text-align: center;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .logo-icon { font-size: 40px; color: #2b6cb0; }
    .logo-text {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(to right, #2b6cb0, #2d3748);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.05em;
    }
    .subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .auth-content { padding: 0 40px 40px; }
    .auth-footer {
      padding: 16px;
      background: rgba(0,0,0,0.02);
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AuthLayoutComponent {}
