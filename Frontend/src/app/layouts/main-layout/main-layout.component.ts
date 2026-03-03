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
    <mat-sidenav-container class="layout-container">

      <!-- SIDEBAR -->
      <mat-sidenav
        #drawer
        mode="side"
        opened
        class="main-sidenav"
      >
        <app-sidebar></app-sidebar>
      </mat-sidenav>

      <!-- MAIN CONTENT -->
      <mat-sidenav-content class="layout-content">

        <!-- HEADER -->
        <div class="header-shell">
          <app-header></app-header>
        </div>

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
    /* =========================
       GLOBAL LAYOUT
    ========================== */

    .layout-container {
      height: 100vh;
      background: linear-gradient(
        135deg,
        #f8fafc 0%,
        #eef2f7 100%
      );
    }

    /* =========================
       SIDEBAR
    ========================== */

    .main-sidenav {
      width: 270px;
      border-right: none;
      background: linear-gradient(180deg, #1e293b, #0f172a);
      color: #ffffff;
      box-shadow: 6px 0 25px rgba(0, 0, 0, 0.12);
      backdrop-filter: blur(8px);
      transition: width 0.3s ease;
    }

    /* =========================
       CONTENT AREA
    ========================== */

    .layout-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* =========================
       HEADER SHELL
    ========================== */

    .header-shell {
      backdrop-filter: blur(12px);
      background: rgba(255, 255, 255, 0.75);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      z-index: 10;
    }

    /* =========================
       PAGE WRAPPER
    ========================== */

    .page-shell {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
    }

    .page-container {
      min-height: 100%;
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.05),
        0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
    }

    .page-container:hover {
      transform: translateY(-2px);
      box-shadow:
        0 14px 35px rgba(0, 0, 0, 0.08),
        0 4px 12px rgba(0, 0, 0, 0.05);
    }

    /* =========================
       RESPONSIVE
    ========================== */

    @media (max-width: 1024px) {
      .page-shell {
        padding: 20px;
      }

      .page-container {
        padding: 20px;
        border-radius: 16px;
      }
    }

    @media (max-width: 768px) {
      .main-sidenav {
        width: 0;
      }

      .page-shell {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent {}