import { Component, input, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { ChartWrapperComponent } from '../../../../shared/components/chart-wrapper/chart-wrapper.component';
import { DashboardSummary } from '../../../../core/models/assignment';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-lead-dashboard',
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
    <div class="dashboard-content">
      <div class="dashboard-header">
        <h1>Team Performance Dashboard</h1>
        <p class="subtitle">Real-time capacity and utilization metrics</p>
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Member Workload (Planned Hours)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-chart-wrapper
              type="bar"
              [data]="memberChartData()"
              [height]="350">
            </app-chart-wrapper>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Category Allocation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-chart-wrapper
              type="pie"
              [data]="categoryChartData()"
              [height]="350">
            </app-chart-wrapper>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="utilization-footer">
        <div class="util-info">
          <span class="label">Overall Plan Capacity</span>
          <span class="value">{{ completionPercentage() }}%</span>
        </div>
        <mat-progress-bar
          mode="determinate"
          [value]="completionPercentage()"
          class="util-progress">
        </mat-progress-bar>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-content { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .dashboard-header { margin-bottom: 32px; }
    .dashboard-header h1 { margin: 0; font-size: 1.85rem; font-weight: 800; color: #0f172a; }
    .subtitle { margin: 4px 0 0; color: #64748b; }

    .charts-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card { border: none; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .chart-card mat-card-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; padding: 20px 20px 0; }
    
    .utilization-footer {
      padding: 24px;
      border: none;
      border-radius: 16px;
      background: #f8fafc;
    }

    .util-info { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .util-info .label { font-weight: 600; color: #64748b; }
    .util-info .value { font-weight: 800; color: #3b82f6; }
    .util-progress { height: 10px; border-radius: 5px; }

    @media (max-width: 1024px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LeadDashboardComponent {

  summary = input<DashboardSummary | null>(null);

  totalCompletedHours = computed(() => {
    return this.summary()?.memberProgress.reduce((acc, m) => acc + (m.completed * 4), 0) || 0;
  });

  completedTaskCount = computed(() => {
    return this.summary()?.memberProgress.reduce((acc, m) => acc + m.completed, 0) || 0;
  });

  categoryChartData = signal<ChartConfiguration['data']>({
    labels: ['Client', 'Tech Debt', 'R&D'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0
    }]
  });

  memberChartData = signal<ChartConfiguration['data']>({
    labels: [],
    datasets: [{
      data: [],
      label: 'Planned Hours',
      backgroundColor: '#3b82f6'
    }]
  });

  constructor() {
    effect(() => {
      const data = this.summary();
      if (data) {
        this.updateCharts(data);
      }
    });
  }

  updateCharts(summary: DashboardSummary) {
    this.categoryChartData.set({
      labels: ['Client', 'Tech Debt', 'R&D'],
      datasets: [
        {
          data: summary.categoryUtilization.map(c => c.used),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 0
        }
      ]
    });

    this.memberChartData.set({
      labels: summary.memberProgress.map(m => m.name),
      datasets: [
        {
          data: summary.memberProgress.map(m => m.totalHours),
          label: 'Planned Hours',
          backgroundColor: '#3b82f6'
        }
      ]
    });
  }

  completionPercentage() {
    const sum = this.summary();

    if (!sum || sum.planSummary.totalAvailable === 0) {
      return 0;
    }

    return Math.round(
      (sum.planSummary.totalPlanned / sum.planSummary.totalAvailable) * 100
    );
  }

}