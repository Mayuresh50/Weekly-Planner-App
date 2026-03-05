import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <mat-sidenav-container class="layout-container" [hasBackdrop]="false">

      <!-- SIDEBAR -->
      <mat-sidenav
        #drawer
        mode="side"
        opened
        class="main-sidenav"
        [style.width]="sidebar.isCollapsed() ? '80px' : '270px'"
      >
        <app-sidebar #sidebar></app-sidebar>
      </mat-sidenav>

      <!-- MAIN CONTENT -->
      <mat-sidenav-content class="layout-content">

        <!-- HEADER -->
        <header class="header-shell">
          <app-header></app-header>
        </header>

        <!-- PAGE BODY -->
        <main class="page-shell">
          <div class="page-container">
            <router-outlet></router-outlet>
          </div>
        </main>

      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      background: #f8fafc;
    }

    .main-sidenav {
      border-right: 1px solid rgba(0, 0, 0, 0.05);
      background: #0f172a;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-x: hidden;
    }

    .layout-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f1f5f9;
    }

    .header-shell {
      z-index: 100;
      position: sticky;
      top: 0;
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
      
      .main-sidenav {
        position: fixed;
      }
    }
  `]
})
export class MainLayoutComponent {}
