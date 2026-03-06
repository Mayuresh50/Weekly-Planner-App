import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TopNavbarComponent
  ],
  template: `
    <div class="layout-wrapper">
      <!-- TOP NAVIGATION -->
      <app-top-navbar></app-top-navbar>

      <!-- MAIN CONTENT -->
      <main class="page-shell">
        <div class="page-container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8fafc;
    }

    .page-shell {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
      scroll-behavior: smooth;
    }

    .page-container {
      max-width: 1440px;
      margin: 0 auto;
      min-height: 100%;
    }

    @media (max-width: 768px) {
      .page-shell {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent {}
