import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { PlanningService } from '../../../core/services/planning.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { DashboardSummary } from '../../../core/models/assignment';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressBarModule, 
    MatButtonModule,
    ChartWrapperComponent
  ],
  template: `
    <div class="dashboard-page">
      <header class="page-header">
        <h1>Overview</h1>
        <div class="header-actions">
          <button mat-flat-button color="primary" *ngIf="summary()?.planSummary?.isFrozen === false">
            <mat-icon>save</mat-icon>
            <span>Freeze Weekly Plan</span>
          </button>
        </div>
      </header>

      <section class="kpi-grid">
        <mat-card class="kpi-card primary">
          <mat-card-content>
            <div class="kpi-icon"><mat-icon>event_available</mat-icon></div>
            <div class="kpi-info">
              <div class="label">Total Planned</div>
              <div class="value">{{ summary()?.planSummary?.totalPlanned || 0 }}h</div>
              <div class="subtext">out of {{ summary()?.planSummary?.totalAvailable || 0 }}h capacity</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card success">
          <mat-card-content>
            <div class="kpi-icon"><mat-icon>trending_up</mat-icon></div>
            <div class="kpi-info">
              <div class="label">Completion</div>
              <div class="value">{{ completionPercentage() }}%</div>
              <mat-progress-bar mode="determinate" [value]="completionPercentage()"></mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card info">
          <mat-card-content>
            <div class="kpi-icon"><mat-icon>groups</mat-icon></div>
            <div class="kpi-info">
              <div class="label">Team Load</div>
              <div class="value">{{ memberCount() }} Members</div>
              <div class="subtext">Fully Allocated</div>
            </div>
          </mat-card-content>
        </mat-card>
      </section>

      <div class="charts-row">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Category Utilization</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-chart-wrapper 
              type="pie" 
              [data]="categoryChartData" 
              [height]="320">
            </app-chart-wrapper>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Member Workload</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-chart-wrapper 
              type="bar" 
              [data]="memberChartData" 
              [height]="320">
            </app-chart-wrapper>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 32px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-header h1 { margin: 0; font-weight: 700; font-size: 1.75rem; }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .kpi-card { border: none; border-radius: 12px; transition: transform 0.2s; }
    .kpi-card:hover { transform: translateY(-4px); }
    .kpi-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
    }
    .kpi-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-icon mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .kpi-info { flex: 1; }
    .kpi-info .label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 4px; }
    .kpi-info .value { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    
    .primary .kpi-icon { background: rgba(43, 108, 176, 0.1); color: #2b6cb0; }
    .success .kpi-icon { background: rgba(72, 187, 120, 0.1); color: #48bb78; }
    .info .kpi-icon { background: rgba(66, 153, 225, 0.1); color: #4299e1; }
    
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .chart-card { border: none; border-radius: 12px; }
    .chart-card mat-card-header { margin-bottom: 16px; }

    @media (max-width: 1024px) {
      .charts-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  private planningService = inject(PlanningService);
  private assignmentService = inject(AssignmentService);

  summary = signal<DashboardSummary | null>(null);

  categoryChartData: ChartConfiguration['data'] = {
    labels: ['Client', 'Tech Debt', 'R&D'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#2b6cb0', '#48bb78', '#ed8936'] }]
  };

  memberChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Hours Allocated', backgroundColor: '#4299e1' }]
  };

  ngOnInit() {
    this.planningService.getCurrentPlan().subscribe(plan => {
      if (plan) {
        this.assignmentService.getDashboardSummary(plan.id).subscribe(summary => {
          this.summary.set(summary);
          this.updateCharts(summary);
        });
      }
    });
  }

  updateCharts(summary: DashboardSummary) {
    this.categoryChartData = {
      ...this.categoryChartData,
      datasets: [{
        ...this.categoryChartData.datasets[0],
        data: summary.categoryUtilization.map(c => c.used)
      }]
    };

    this.memberChartData = {
      labels: summary.memberProgress.map(m => m.name),
      datasets: [{
        ...this.memberChartData.datasets[0],
        data: summary.memberProgress.map(m => m.totalHours)
      }]
    };
  }

  completionPercentage() {
    const sum = this.summary();
    if (!sum) return 0;
    return Math.round((sum.planSummary.totalPlanned / sum.planSummary.totalAvailable) * 100);
  }

  memberCount() {
    return this.summary()?.memberProgress.length || 0;
  }
}
