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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, startWith, Observable } from 'rxjs';

@Component({
  selector: 'app-item-picker-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatListModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Pick a Backlog Item</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Search Backlog</mat-label>
        <input matInput [formControl]="searchControl" placeholder="Find a task...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      
      <mat-nav-list class="item-list">
        <button mat-list-item *ngFor="let item of filteredItems$ | async" (click)="onSelect(item)">
          <mat-icon matListItemIcon [ngClass]="getCategoryClass(item.category)">label</mat-icon>
          <span matListItemTitle>{{ item.title }}</span>
          <span matListItemLine>{{ item.category }} • {{ item.estimatedHours }}h estimated</span>
        </button>
        @if ((filteredItems$ | async)?.length === 0) {
          <div class="empty-msg">
            No matching items found in the backlog.
          </div>
        }
      </mat-nav-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-top: 8px; }
    .item-list { max-height: 400px; overflow-y: auto; }
    .empty-msg { padding: 32px; text-align: center; color: var(--text-secondary); }
    .chip-client { color: #2b6cb0; }
    .chip-techdebt { color: #6b46c1; }
    .chip-rnd { color: #c05621; }
  `]
})
export class ItemPickerDialogComponent implements OnInit {
  private backlogService = inject(BacklogService);
  private dialogRef = inject(MatDialogRef<ItemPickerDialogComponent>);

  searchControl = new FormControl('');
  items: BacklogItem[] = [];
  filteredItems$!: Observable<BacklogItem[]>;

  ngOnInit() {
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
    this.dialogRef.close(item);
  }

  onCancel() {
    this.dialogRef.close();
  }

  getCategoryClass(category: Category) {
    return `chip-${category.toLowerCase().replace(' ', '')}`;
  }
}
