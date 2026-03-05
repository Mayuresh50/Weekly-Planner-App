import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BacklogService } from '../../../core/services/backlog.service';
import { BacklogItem, Category } from '../../../core/models/backlog';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, startWith, Observable } from 'rxjs';

import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/auth';

@Component({
  selector: 'app-item-picker-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatListModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Assign Work Item</h2>
    <mat-dialog-content>
      <div class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select Team Member</mat-label>
          <mat-select [formControl]="memberControl">
            <mat-option *ngFor="let m of members" [value]="m.id">
              {{ m.name }} ({{ m.email }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="memberControl.invalid">Please select a member</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Search Backlog Items</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Search by title...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
      
      <div class="list-section">
        <h3 class="section-title">Available in Backlog</h3>
        <mat-nav-list class="item-list">
          <button mat-list-item *ngFor="let item of filteredItems$ | async" (click)="onSelect(item)" [disabled]="memberControl.invalid">
            <mat-icon matListItemIcon [ngClass]="getCategoryClass(item.category)">label</mat-icon>
            <span matListItemTitle>{{ item.title }}</span>
            <span matListItemLine>{{ item.category }} • {{ item.estimatedHours }}h</span>
          </button>
          
          <div *ngIf="(filteredItems$ | async)?.length === 0" class="empty-msg">
            No matching backlog items found.
          </div>
        </mat-nav-list>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    .dialog-form { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .list-section { margin-top: 16px; }
    .section-title { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; padding-left: 4px; }
    .item-list { max-height: 300px; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 8px; }
    .empty-msg { padding: 32px; text-align: center; color: #94a3b8; font-size: 0.9rem; }
    .chip-client { color: #3b82f6; }
    .chip-techdebt { color: #10b981; }
    .chip-rnd { color: #f59e0b; }
  `]
})
export class ItemPickerDialogComponent implements OnInit {
  private backlogService = inject(BacklogService);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<ItemPickerDialogComponent>);

  searchControl = new FormControl('');
  memberControl = new FormControl('', Validators.required);
  items: BacklogItem[] = [];
  members: User[] = [];
  filteredItems$!: Observable<BacklogItem[]>;

  ngOnInit() {
    // Load members
    this.userService.getMembers().subscribe(users => {
      this.members = users.filter(u => u.role === Role.TeamMember);
    });

    // Load backlog items
    this.backlogService.getAll().pipe(
      map(items => items.filter(i => i.status === 'Backlog'))
    ).subscribe(items => {
      this.items = items;
      this.setupFilter();
    });
  }

  setupFilter() {
    this.filteredItems$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(val => this.items.filter(i => i.title.toLowerCase().includes(val?.toLowerCase() || '')))
    );
  }

  onSelect(item: BacklogItem) {
    if (this.memberControl.valid) {
      this.dialogRef.close({ item, userId: this.memberControl.value });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getCategoryClass(category: Category) {
    return `chip-${category.toLowerCase().replace(' ', '')}`;
  }
}
