import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { PlanningService } from '../../../core/services/planning.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DashboardSummary, TaskAssignment } from '../../../core/models/assignment';
import { ItemPickerDialogComponent } from './item-picker-dialog.component';
import { User, Role } from '../../../core/models/auth';
import { BacklogItem } from '../../../core/models/backlog';

@Component({
  selector: 'app-assignment-manager',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule, 
    MatTableModule, 
    MatDialogModule,
    MatSliderModule,
    FormsModule
  ],
  template: `
    <div class="assignment-page">
      <header class="dashboard-header">
        <div class="title-group">
          <h1>{{ isLead() ? 'Team Assignment Board' : 'My Weekly Plan' }}</h1>
          <p class="subtitle" *ngIf="activePlanId()">
            {{ isLead() ? 'Strategize and assign workload for the team' : 'Your personal assignment schedule' }}
            (Week of {{ startDate() | date:'mediumDate' }})
          </p>
        </div>
        <div class="header-actions">
           <button mat-flat-button color="primary" class="action-btn" (click)="openItemPicker()" [disabled]="isFrozen()">
            <mat-icon>add_task</mat-icon>
            <span>{{ isLead() ? 'Assign Item to Member' : 'Self-Assign Item' }}</span>
          </button>
        </div>
      </header>

      <!-- CAPACITY TRACKER -->
      <section class="capacity-overview">
        <mat-card class="data-box capacity-card">
          <mat-card-content>
            <div class="capacity-top">
              <div class="capacity-label">
                <span class="main-text">Weekly Bandwidth</span>
                <span class="sub-text">Calculated based on 30h standard capacity</span>
              </div>
              <div class="capacity-stats" [class.warning]="totalAllocated() >= 25" [class.danger]="totalAllocated() > 30">
                <span class="current">{{ totalAllocated() }}</span>
                <span class="separator">/</span>
                <span class="max">30h</span>
              </div>
            </div>
            
            <div class="progress-wrapper">
              <div class="progress-bg">
                <div class="progress-fill" [style.width.%]="(totalAllocated() / 30) * 100" 
                     [class.filled]="totalAllocated() >= 30"
                     [class.over]="totalAllocated() > 30">
                </div>
              </div>
            </div>

            <div class="capacity-footer">
              <div class="status-indicator" *ngIf="totalAllocated() < 30">
                <mat-icon>info</mat-icon>
                <span>{{ 30 - totalAllocated() }} hours available for additional tasks</span>
              </div>
              <div class="status-indicator success" *ngIf="totalAllocated() === 30">
                <mat-icon>check_circle</mat-icon>
                <span>Perfect capacity utilization</span>
              </div>
              <div class="status-indicator danger" *ngIf="totalAllocated() > 30">
                <mat-icon>warning</mat-icon>
                <span>Over-allocated by {{ totalAllocated() - 30 }} hours</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- ASSIGNMENTS TABLE -->
      <mat-card class="data-box table-card">
        <mat-card-header>
          <mat-card-title>Assigned Responsibilities</mat-card-title>
        </mat-card-header>
        
        <div class="table-container">
          <table mat-table [dataSource]="assignments()" class="enterprise-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef> Task Details </th>
              <td mat-cell *matCellDef="let row"> 
                <div class="task-info">
                  <span class="task-title">{{row.backlogItemTitle}}</span>
                  <span class="task-meta">{{ isLead() ? 'Assigned to ' + row.userName : 'Assigned to me' }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="hours">
              <th mat-header-cell *matHeaderCellDef> Allocation </th>
              <td mat-cell *matCellDef="let row"> 
                <span class="hour-capsule">{{row.assignedHours}}h</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="progress">
              <th mat-header-cell *matHeaderCellDef> Work Progress </th>
              <td mat-cell *matCellDef="let row">
                <div class="progress-interact">
                  <mat-slider min="0" max="100" step="10" discrete [disabled]="isFrozen()" class="compact-slider">
                    <input matSliderThumb [(ngModel)]="row.progressPercentage" (change)="onProgressChange(row)">
                  </mat-slider>
                  <span class="pct-val">{{row.progressPercentage}}%</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Workflow </th>
              <td mat-cell *matCellDef="let row">
                <span class="workflow-badge" [attr.data-status]="row.status">
                  {{row.status}}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="item-interactive-row"></tr>
          </table>
          
          <div class="empty-state-view" *ngIf="assignments().length === 0">
            <div class="empty-icon-wrap">
              <mat-icon>event_busy</mat-icon>
            </div>
            <h3>No assignments found</h3>
            <p>{{ isLead() ? 'Start assigning backlog items to team members to build the weekly schedule.' : 'You have no tasks assigned to you for this week yet.' }}</p>
            <button mat-flat-button color="primary" class="action-btn" (click)="openItemPicker()" [disabled]="isFrozen()">
               {{ isLead() ? 'Assign First Item' : 'Browse Backlog' }}
            </button>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .assignment-page { animation: fadeIn 0.4s ease-out; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .dashboard-header h1 { 
      margin: 0; 
      font-size: 1.85rem; 
      font-weight: 800; 
      color: #0f172a; 
      letter-spacing: -0.025em; 
    }

    .subtitle { margin: 4px 0 0; color: #64748b; font-size: 0.95rem; }
    .header-actions { display: flex; gap: 12px; }
    .action-btn { border-radius: 12px; font-weight: 600; height: 44px; padding: 0 20px; }

    /* DATA BOX & CAPACITY */
    .data-box { 
      border: none; 
      border-radius: 24px; 
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
      background: white;
    }

    .capacity-overview { margin-bottom: 32px; }
    .capacity-card { padding: 32px; }

    .capacity-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
    }

    .capacity-label .main-text { display: block; font-size: 1.15rem; font-weight: 700; color: #0f172a; }
    .capacity-label .sub-text { display: block; font-size: 0.85rem; color: #64748b; margin-top: 2px; }

    .capacity-stats { font-weight: 800; display: flex; align-items: baseline; gap: 2px; }
    .capacity-stats .current { font-size: 2.25rem; color: #3b82f6; }
    .capacity-stats .separator { font-size: 1.25rem; color: #cbd5e1; margin: 0 4px; }
    .capacity-stats .max { font-size: 1.25rem; color: #64748b; }

    .capacity-stats.warning .current { color: #f59e0b; }
    .capacity-stats.danger .current { color: #ef4444; }

    .progress-wrapper { width: 100%; margin-bottom: 20px; }
    .progress-bg { height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
    .progress-fill { 
      height: 100%; 
      background: #3b82f6; 
      border-radius: 6px; 
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .progress-fill.filled { background: #10b981; }
    .progress-fill.over { background: #ef4444; }

    .capacity-footer { display: flex; gap: 16px; }
    .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 600; color: #64748b; }
    .status-indicator mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .status-indicator.success { color: #10b981; }
    .status-indicator.danger { color: #ef4444; }

    /* TABLE STYLES */
    .table-card { overflow: hidden; }
    .table-card mat-card-title { padding: 24px 24px 0; font-size: 1.15rem; font-weight: 700; color: #0f172a; }
    .table-container { min-height: 300px; padding: 0 12px 12px; }
    .enterprise-table { width: 100%; background: transparent; }

    .task-info { display: flex; flex-direction: column; gap: 2px; }
    .task-title { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
    .task-meta { font-size: 0.75rem; color: #94a3b8; }

    .hour-capsule {
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 10px;
      font-weight: 700;
      color: #334155;
      font-size: 0.85rem;
    }

    .progress-interact { display: flex; align-items: center; gap: 16px; width: 240px; }
    .compact-slider { flex: 1; }
    .pct-val { width: 45px; font-weight: 700; color: #64748b; font-size: 0.9rem; font-variant-numeric: tabular-nums; }

    .workflow-badge {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .workflow-badge[data-status="Backlog"] { background: #f8fafc; color: #64748b; }
    .workflow-badge[data-status="Planned"] { background: #eff6ff; color: #2563eb; }
    .workflow-badge[data-status="InProgress"] { background: #fff7ed; color: #ea580c; }
    .workflow-badge[data-status="Completed"] { background: #f0fdf4; color: #16a34a; }

    .item-interactive-row:hover { background: #f8fafc; cursor: pointer; }

    /* EMPTY STATE */
    .empty-state-view {
      padding: 80px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon-wrap {
      width: 72px;
      height: 72px;
      background: #f1f5f9;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .empty-icon-wrap mat-icon { font-size: 36px; width: 36px; height: 36px; color: #cbd5e1; }
    .empty-state-view h3 { margin: 0; font-weight: 700; color: #1e293b; }
    .empty-state-view p { color: #64748b; margin-top: 8px; margin-bottom: 24px; }
  `]
})
export class AssignmentManagerComponent implements OnInit {
  private planningService = inject(PlanningService);
  private assignmentService = inject(AssignmentService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  activePlanId = signal<string | null>(null);
  startDate = signal<string | null>(null);
  isFrozen = signal<boolean>(false);
  assignments = signal<TaskAssignment[]>([]);
  
  isLead = computed(() => this.authService.isTeamLead());
  
  displayedColumns: string[] = ['title', 'hours', 'progress', 'status'];
  
  totalAllocated = computed(() => {
    return this.assignments().reduce((sum, curr) => sum + curr.assignedHours, 0);
  });

  ngOnInit() {
    this.loadActivePlan();
  }

  loadActivePlan() {
    this.planningService.getCurrentPlan().subscribe(plan => {
      if (plan) {
        this.activePlanId.set(plan.id);
        this.startDate.set(plan.startDate);
        this.isFrozen.set(plan.isFrozen);
        this.loadAssignments();
      }
    });
  }

  loadAssignments() {
    const user = this.authService.currentUser();
    if (this.activePlanId() && user) {
      this.assignmentService.getDashboard().subscribe(summary => {
        let tasks = summary.taskLevelProgress;
        
        // If not a lead, only show personal assignments
        if (!this.isLead()) {
          tasks = tasks.filter(t => t.memberName === user.name);
        }

        // Map Dashboard Task to Local Assignment display model
        this.assignments.set(tasks.map(t => ({
          id: t.id,
          weeklyPlanId: this.activePlanId()!,
          backlogItemId: '', // Not used for display
          backlogItemTitle: t.title,
          userId: '', // Not used for display
          userName: t.memberName,
          assignedHours: t.hours,
          progressPercentage: t.progress,
          status: t.status
        })));
      });
    }
  }

  openItemPicker() {
    const dialogRef = this.dialog.open(ItemPickerDialogComponent, { width: '600px' });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assignItem(result.item, result.userId);
      }
    });
  }

  assignItem(item: BacklogItem, userId: string) {
    if (!this.activePlanId()) return;

    const payload = {
      backlogItemId: item.id,
      userId: userId,
      assignedHours: item.estimatedHours
    };

    this.assignmentService.assignTask(payload).subscribe({
      next: () => {
        this.notificationService.success(`Assigned "${item.title}" successfully.`);
        this.loadAssignments();
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || 'Failed to assign item';
        this.notificationService.error(errorMsg);
      }
    });
  }

  onProgressChange(row: any) {
    this.assignmentService.updateProgress(row.id, row.progressPercentage).subscribe({
      next: () => this.notificationService.info('Progress updated'),
      error: () => this.notificationService.error('Failed to update progress')
    });
  }
}
