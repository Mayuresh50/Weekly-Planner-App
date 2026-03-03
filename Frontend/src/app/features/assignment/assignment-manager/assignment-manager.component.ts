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
      <header class="page-header">
        <div class="header-main">
          <h1>My Weekly Plan</h1>
          <p class="subtitle" *ngIf="activePlanId()">Week of {{ startDate() | date:'mediumDate' }}</p>
        </div>
        <div class="header-actions">
           <button mat-flat-button color="primary" (click)="openItemPicker()" [disabled]="isFrozen()">
            <mat-icon>add</mat-icon>
            <span>Assign Work Item</span>
          </button>
        </div>
      </header>

      <div class="capacity-section">
        <mat-card class="capacity-card">
          <mat-card-content>
            <div class="capacity-header">
              <span class="label">Total Allocation</span>
              <span class="value" [ngClass]="{'at-capacity': totalAllocated() === 30, 'over': totalAllocated() > 30}">
                {{ totalAllocated() }} / 30 Hours
              </span>
            </div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="(totalAllocated() / 30) * 100"
              [color]="totalAllocated() > 30 ? 'warn' : 'primary'">
            </mat-progress-bar>
            <p class="capacity-msg" *ngIf="totalAllocated() < 30">You have {{ 30 - totalAllocated() }} hours remaining.</p>
            <p class="capacity-msg success" *ngIf="totalAllocated() === 30">Capacity filled perfectly! ready to freeze.</p>
            <p class="capacity-msg error" *ngIf="totalAllocated() > 30">Warning: You are over-allocated by {{ totalAllocated() - 30 }} hours.</p>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="tasks-card">
        <table mat-table [dataSource]="assignments()" class="tasks-table">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef> Work Item </th>
            <td mat-cell *matCellDef="let row"> {{row.backlogItemTitle}} </td>
          </ng-container>

          <ng-container matColumnDef="hours">
            <th mat-header-cell *matHeaderCellDef> Assigned Hours </th>
            <td mat-cell *matCellDef="let row"> 
              <div class="hours-cell">
                <span>{{row.assignedHours}}h</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="progress">
            <th mat-header-cell *matHeaderCellDef> Completion </th>
            <td mat-cell *matCellDef="let row">
              <div class="progress-cell">
                <mat-slider min="0" max="100" step="10" discrete [disabled]="isFrozen()">
                  <input matSliderThumb [(ngModel)]="row.progressPercentage" (change)="onProgressChange(row)">
                </mat-slider>
                <span class="pct">{{row.progressPercentage}}%</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let row">
              <span class="status-badge" [ngClass]="row.status.toLowerCase()">{{row.status}}</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div class="empty-tasks" *ngIf="assignments().length === 0">
          <mat-icon>assignment_late</mat-icon>
          <p>No tasks assigned for this week yet.</p>
          <button mat-stroked-button color="primary" (click)="openItemPicker()" [disabled]="isFrozen()">Pick from Backlog</button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .assignment-page { padding: 32px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header-main h1 { margin: 0; font-weight: 700; font-size: 1.75rem; }
    .subtitle { margin: 4px 0 0; color: var(--text-secondary); font-size: 0.9rem; }
    
    .capacity-section { margin-bottom: 32px; }
    .capacity-card { border: none; border-radius: 12px; }
    .capacity-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .capacity-header .label { font-weight: 600; color: var(--text-color); }
    .capacity-header .value { font-weight: 800; font-size: 1.25rem; }
    .capacity-header .value.at-capacity { color: #48bb78; }
    .capacity-header .value.over { color: #f56565; }
    
    mat-progress-bar { height: 10px; border-radius: 5px; }
    .capacity-msg { margin: 8px 0 0; font-size: 0.8125rem; }
    .capacity-msg.success { color: #48bb78; font-weight: 600; }
    .capacity-msg.error { color: #f56565; font-weight: 600; }
    
    .tasks-card { border: none; border-radius: 12px; overflow: hidden; }
    .tasks-table { width: 100%; }
    .hours-cell { font-weight: 600; }
    .progress-cell { display: flex; align-items: center; gap: 12px; width: 220px; }
    .progress-cell mat-slider { flex: 1; }
    .pct { width: 40px; font-variant-numeric: tabular-nums; font-weight: 600; color: var(--text-secondary); }
    
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .backlog { background: #edf2f7; color: #4a5568; }
    .planned { background: #ebf8ff; color: #2b6cb0; }
    .inprogress { background: #fffaf0; color: #c05621; }
    .completed { background: #f0fff4; color: #276749; }
    
    .empty-tasks { padding: 48px; text-align: center; color: var(--text-secondary); }
    .empty-tasks mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.3; }
    .empty-tasks p { margin-bottom: 16px; }
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
    const userId = this.authService.currentUser()?.id;
    if (this.activePlanId() && userId) {
      this.assignmentService.getDashboardSummary(this.activePlanId()!).subscribe(summary => {
        // Find tasks for current user
        const userTasks = summary.taskLevelProgress.filter(t => t.memberName === this.authService.currentUser()?.name);
        // Map to TaskAssignment-like structure for the table
        this.assignments.set(userTasks.map(t => ({
          id: t.id,
          weeklyPlanId: this.activePlanId()!,
          backlogItemId: '', // not needed for display
          backlogItemTitle: t.title,
          userId: userId,
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
    
    dialogRef.afterClosed().subscribe(item => {
      if (item) {
        this.assignItem(item);
      }
    });
  }

  assignItem(item: BacklogItem) {
    const userId = this.authService.currentUser()?.id;
    if (!userId || !this.activePlanId()) return;

    const payload = {
      weeklyPlanId: this.activePlanId()!,
      backlogItemId: item.id,
      userId: userId,
      assignedHours: item.estimatedHours
    };

    if (this.totalAllocated() + item.estimatedHours > 30) {
      if (!confirm(`Warning: Adding this item will put you over the 30h capacity. Continue?`)) {
        return;
      }
    }

    this.assignmentService.assignTask(payload).subscribe({
      next: () => {
        this.notificationService.success(`Assigned "${item.title}" to your plan.`);
        this.loadAssignments();
      },
      error: () => this.notificationService.error('Failed to assign item')
    });
  }

  onProgressChange(row: any) {
    this.assignmentService.updateProgress(row.id, row.progressPercentage).subscribe({
      next: () => this.notificationService.info('Progress updated'),
      error: () => this.notificationService.error('Failed to update progress')
    });
  }
}
