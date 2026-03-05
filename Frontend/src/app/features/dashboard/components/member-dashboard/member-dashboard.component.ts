import { Component, inject, signal, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartWrapperComponent } from '../../../../shared/components/chart-wrapper/chart-wrapper.component';
import { DashboardSummary } from '../../../../core/models/assignment';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltipModule,
    ChartWrapperComponent
  ],
  template: `
    <div class="dashboard-content">
      <header class="dashboard-header">
        <div class="title-group">
          <h1>My Workboard</h1>
          <p class="subtitle">Your weekly schedule and assignment progress</p>
        </div>
      </header>

      <!-- KPI SECTION -->
      <section class="kpi-row">
        <mat-card class="stats-card">
          <div class="stats-icon primary">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="stats-data">
            <span class="stats-label">Assigned Hours</span>
            <h3 class="stats-value">{{ myTotalHours() }}h</h3>
            <span class="stats-info">Allocated this week</span>
          </div>
        </mat-card>

        <mat-card class="stats-card">
          <div class="stats-icon success">
            <mat-icon>donut_large</mat-icon>
          </div>
          <div class="stats-data">
            <span class="stats-label">Completion</span>
            <h3 class="stats-value">{{ myOverallProgress() }}%</h3>
            <div class="stats-progress-container">
              <mat-progress-bar mode="determinate" [value]="myOverallProgress()"></mat-progress-bar>
            </div>
          </div>
        </mat-card>

        <mat-card class="stats-card">
          <div class="stats-icon info">
            <mat-icon>list_alt</mat-icon>
          </div>
          <div class="stats-data">
            <span class="stats-label">Pending Tasks</span>
            <h3 class="stats-value">{{ pendingTaskCount() }}</h3>
            <span class="stats-info">Awaiting completion</span>
          </div>
        </mat-card>
      </section>

      <div class="dashboard-grid">
        <!-- TASK LIST -->
        <mat-card class="data-box tasks-table">
          <mat-card-header>
            <mat-card-title>My Weekly Assignments</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="myTasks()" class="w-full enterprise-table">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef> Task Details </th>
                <td mat-cell *matCellDef="let element"> 
                  <div class="task-title-cell">
                    <span class="task-name">{{element.title}}</span>
                    <span class="task-id">#{{element.id.substring(0,8)}}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef> Category </th>
                <td mat-cell *matCellDef="let element"> 
                  <span class="cat-badge" [attr.data-category]="element.category">
                    {{element.category}}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="hours">
                <th mat-header-cell *matHeaderCellDef> Hours </th>
                <td mat-cell *matCellDef="let element"> 
                  <span class="hours-tag">{{element.hours}}h</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="progress">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let element"> 
                  <div class="status-cell">
                    <div class="progress-info">
                      <span>{{element.progress}}%</span>
                      <mat-progress-bar mode="determinate" [value]="element.progress"></mat-progress-bar>
                    </div>
                    <button mat-icon-button color="primary" matTooltip="Log Progress">
                      <mat-icon>edit_note</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover-row"></tr>
            </table>

            <div *ngIf="myTasks().length === 0" class="empty-placeholder">
              <mat-icon>inbox</mat-icon>
              <p>You have no assignments for this week yet.</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- PERSONAL CHARTS -->
        <div class="side-panel">
          <mat-card class="data-box chart-box">
            <mat-card-header>
              <mat-card-title>Weekly Capacity</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-chart-wrapper 
                type="doughnut" 
                [data]="personalChartData()" 
                [height]="260">
              </app-chart-wrapper>
              <div class="chart-legend">
                <div class="legend-item"><span class="dot planned"></span> Planned: {{ myTotalHours() }}h</div>
                <div class="legend-item"><span class="dot free"></span> Free: {{ 30 - myTotalHours() }}h</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="data-box quote-card">
            <mat-card-content>
              <mat-icon class="quote-icon">lightbulb</mat-icon>
              <p class="quote-text">Focus on high-priority client tasks first to maintain team velocity.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content { animation: fadeIn 0.4s ease-out; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-header { margin-bottom: 32px; }
    .dashboard-header h1 { margin: 0; font-size: 1.85rem; font-weight: 800; color: #0f172a; }
    .subtitle { margin: 4px 0 0; color: #64748b; font-size: 0.95rem; }

    /* KPI STYLES */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stats-card {
      padding: 24px;
      border: none;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .stats-icon {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stats-icon.primary { background: #eff6ff; color: #3b82f6; }
    .stats-icon.success { background: #f0fdf4; color: #22c55e; }
    .stats-icon.info { background: #f0f9ff; color: #06b6d4; }

    .stats-label { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .stats-value { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 4px 0; }
    .stats-info { font-size: 0.75rem; color: #94a3b8; }
    .stats-progress-container { margin-top: 8px; width: 100%; }
    .stats-progress-container mat-progress-bar { height: 6px; border-radius: 3px; }

    /* GRID STYLES */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
    }

    .data-box { border: none; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); }
    .data-box mat-card-title { font-size: 1.15rem; font-weight: 700; color: #0f172a; padding: 20px 20px 0; }
    .data-box mat-card-content { padding: 0 20px 20px; }

    /* TABLE STYLES */
    .enterprise-table { background: transparent; }
    .task-title-cell { display: flex; flex-direction: column; }
    .task-name { font-weight: 600; color: #1e293b; }
    .task-id { font-size: 0.7rem; color: #94a3b8; }

    .cat-badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .cat-badge[data-category="Client"] { background: #eff6ff; color: #3b82f6; }
    .cat-badge[data-category="Tech Debt"] { background: #f0fdf4; color: #22c55e; }
    .cat-badge[data-category="R&D"] { background: #fffbeb; color: #f59e0b; }

    .hours-tag {
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      color: #475569;
      font-size: 0.85rem;
    }

    .status-cell { display: flex; align-items: center; gap: 12px; }
    .progress-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .progress-info span { font-size: 0.75rem; font-weight: 600; color: #64748b; }
    .progress-info mat-progress-bar { height: 6px; border-radius: 3px; }

    .hover-row:hover { background: #f8fafc; cursor: pointer; }

    .empty-placeholder {
      padding: 64px;
      text-align: center;
      color: #94a3b8;
    }
    .empty-placeholder mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5; }

    /* SIDE PANEL */
    .side-panel { display: flex; flex-direction: column; gap: 24px; }
    
    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 16px;
    }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #64748b; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.planned { background: #3b82f6; }
    .dot.free { background: #e2e8f0; }

    .quote-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: white;
      text-align: center;
      padding: 24px;
    }
    .quote-icon { font-size: 32px; width: 32px; height: 32px; color: #f59e0b; margin-bottom: 16px; }
    .quote-text { font-size: 0.95rem; font-style: italic; line-height: 1.6; opacity: 0.9; }

    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .side-panel { flex-direction: row; }
      .side-panel > * { flex: 1; }
    }
  `]
})
export class MemberDashboardComponent {

  summary = input<DashboardSummary | null>(null);

  displayedColumns: string[] = ['title', 'category', 'hours', 'progress'];

  myTasks = computed(() => this.summary()?.taskLevelProgress || []);

  myTotalHours = computed(() => {
    return this.myTasks().reduce((acc, t) => acc + t.hours, 0);
  });

  pendingTaskCount = computed(() => {
    return this.myTasks().filter(t => t.progress < 100).length;
  });

  myOverallProgress = computed(() => {
    const tasks = this.myTasks();
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((acc, t) => acc + t.progress, 0);
    return Math.round(totalProgress / tasks.length);
  });

  personalChartData = signal<ChartConfiguration['data']>({
    labels: ['Assigned', 'Remaining'],
    datasets: [
      {
        data: [0, 30],
        backgroundColor: ['#3b82f6', '#e2e8f0'],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  });

  constructor() {
    effect(() => {
      this.updateCharts();
    });
  }

  updateCharts() {
    const assigned = this.myTotalHours();
    const capacity = 30;
    const remaining = Math.max(0, capacity - assigned);

    this.personalChartData.set({
      labels: ['Assigned', 'Remaining'],
      datasets: [
        {
          data: [assigned, remaining],
          backgroundColor: ['#3b82f6', '#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 10
        }
      ]
    });
  }
}
