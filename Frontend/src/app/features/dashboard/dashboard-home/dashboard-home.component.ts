import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PlanningService } from '../../../core/services/planning.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { DashboardSummary } from '../../../core/models/assignment';
import { LeadDashboardComponent } from '../components/lead-dashboard/lead-dashboard.component';
import { MemberDashboardComponent } from '../components/member-dashboard/member-dashboard.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, 
    MatProgressSpinnerModule,
    LeadDashboardComponent,
    MemberDashboardComponent
  ],
  template: `
    <div class="dashboard-container">
      <ng-container *ngIf="isLoading(); else content">
        <div class="loading-state">
          <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
          <p>Loading your dashboard...</p>
        </div>
      </ng-container>

      <ng-template #content>
        <app-lead-dashboard 
          *ngIf="authService.isTeamLead(); else memberView"
          [summary]="summary()">
        </app-lead-dashboard>

        <ng-template #memberView>
          <app-member-dashboard 
            [summary]="summary()">
          </app-member-dashboard>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 32px; background: #f8fafc; min-height: calc(100vh - 64px); }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      color: #64748b;
    }
    .loading-state p { margin-top: 16px; font-weight: 500; }
  `]
})
export class DashboardHomeComponent implements OnInit {
  authService = inject(AuthService);
  private planningService = inject(PlanningService);
  private assignmentService = inject(AssignmentService);

  summary = signal<DashboardSummary | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.assignmentService.getActiveDashboardSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
