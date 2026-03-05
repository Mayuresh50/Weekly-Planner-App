import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/auth';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="team-page">
      <header class="dashboard-header">
        <div class="title-group">
          <h1>Team Management</h1>
          <p class="subtitle">Manage project resources and access control</p>
        </div>
        <div class="header-actions">
           <button mat-flat-button color="primary" class="action-btn" (click)="showAddForm = !showAddForm">
            <mat-icon>{{ showAddForm ? 'close' : 'person_add' }}</mat-icon>
            <span>{{ showAddForm ? 'Cancel' : 'Add Member' }}</span>
          </button>
        </div>
      </header>

      <!-- ADD MEMBER FORM -->
      <mat-card class="data-box form-card" *ngIf="showAddForm">
        <mat-card-header>
          <mat-card-title>Register New Team Member</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="memberForm" (ngSubmit)="onSubmit()" class="member-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name" placeholder="John Doe">
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="email" placeholder="john@example.com">
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput formControlName="password" type="password">
                <mat-icon matPrefix>lock</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Access Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option [value]="Role.TeamMember">Team Member</mat-option>
                  <mat-option [value]="Role.TeamLead">Team Lead</mat-option>
                </mat-select>
                <mat-icon matPrefix>badge</mat-icon>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="memberForm.invalid" class="submit-btn">
                Confirm Registration
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- MEMBERS TABLE -->
      <mat-card class="data-box table-card">
        <mat-card-header>
          <mat-card-title>Current Resources</mat-card-title>
        </mat-card-header>
        
        <div class="table-container">
          <table mat-table [dataSource]="members()" class="enterprise-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef> Member </th>
              <td mat-cell *matCellDef="let row"> 
                <div class="user-cell">
                  <div class="user-avatar">{{ row.name.substring(0,2).toUpperCase() }}</div>
                  <div class="user-info">
                    <span class="user-name">{{ row.name }}</span>
                    <span class="user-email">{{ row.email }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef> Access Level </th>
              <td mat-cell *matCellDef="let row">
                <span class="role-pill" [attr.data-role]="row.role">
                  {{ row.role === Role.TeamLead ? 'Lead' : 'Member' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row" class="actions-col">
                <button mat-icon-button color="primary" matTooltip="Edit Permission">
                  <mat-icon>shield_person</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="onDeleteMember(row)" matTooltip="Remove Member">
                  <mat-icon>person_remove</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="interactive-row"></tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .team-page { animation: fadeIn 0.4s ease-out; }
    
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

    .data-box { 
      border: none; 
      border-radius: 24px; 
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
      background: white;
      margin-bottom: 32px;
      overflow: hidden;
    }

    .form-card { padding: 24px; border: 1px solid #e2e8f0; }
    .form-card mat-card-title { margin-bottom: 24px; font-weight: 700; color: #0f172a; }

    .member-form { display: flex; flex-direction: column; gap: 24px; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .form-actions { display: flex; justify-content: flex-end; }
    .submit-btn { border-radius: 12px; height: 48px; padding: 0 32px; font-weight: 700; }

    .table-card mat-card-title { padding: 24px 24px 0; font-size: 1.15rem; font-weight: 700; color: #0f172a; }
    .table-container { padding: 12px; }
    .enterprise-table { width: 100%; background: transparent; }

    .user-cell { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
    .user-avatar {
      width: 40px;
      height: 40px;
      background: #eff6ff;
      color: #3b82f6;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
    }

    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 600; color: #0f172a; }
    .user-email { font-size: 0.8rem; color: #64748b; }

    .role-pill {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .role-pill[data-role="TeamLead"] { background: #fee2e2; color: #991b1b; }
    .role-pill[data-role="TeamMember"] { background: #f0fdf4; color: #166534; }

    .actions-col { text-align: right; }
    .interactive-row:hover { background: #f8fafc; cursor: pointer; }
  `]
})
export class TeamListComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  Role = Role;
  members = signal<User[]>([]);
  showAddForm = false;
  displayedColumns = ['name', 'role', 'actions'];
  memberForm: FormGroup;

  constructor() {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [Role.TeamMember, Validators.required]
    });
  }

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.userService.getMembers().subscribe({
      next: (data: User[]) => this.members.set(data),
      error: () => this.notificationService.error('Failed to load team members')
    });
  }

  onSubmit() {
    if (this.memberForm.valid) {
      this.userService.registerMember(this.memberForm.value).subscribe({
        next: (response: any) => {
          this.notificationService.success('Member registered successfully');
          this.showAddForm = false;
          this.memberForm.reset({ role: Role.TeamMember });
          this.loadMembers();
        },
        error: () => this.notificationService.error('Registration failed')
      });
    }
  }

  onDeleteMember(user: User) {
    if (confirm(`Are you sure you want to remove ${user.name} from the team? This will also remove all their assignments.`)) {
      this.userService.deleteMember(user.id).subscribe({
        next: () => {
          this.notificationService.success('Member removed successfully');
          this.loadMembers();
        },
        error: () => this.notificationService.error('Failed to remove member')
      });
    }
  }
}
