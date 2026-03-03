import { Component, inject, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { BacklogService } from '../../../core/services/backlog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BacklogItem, Category, BacklogStatus } from '../../../core/models/backlog';
import { CreateBacklogDialogComponent } from './create-backlog-dialog.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-backlog-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatCardModule,
    MatMenuModule
  ],
  template: `
    <div class="backlog-page">
      <header class="page-header">
        <div class="header-main">
          <h1>Product Backlog</h1>
          <p class="subtitle">Manage and prioritize upcoming work items</p>
        </div>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          <span>Add New Item</span>
        </button>
      </header>

      <mat-card class="table-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Items</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Type to filter...">
            <mat-icon matIconPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="category-field">
            <mat-label>Category Filter</mat-label>
            <mat-select [formControl]="categoryControl" multiple>
              <mat-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Item Name </th>
              <td mat-cell *matCellDef="let row"> 
                <div class="title-cell">
                  <div class="main-title">{{row.title}}</div>
                  <div class="subtitle">{{row.description | slice:0:60}}{{row.description?.length > 60 ? '...' : ''}}</div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Category </th>
              <td mat-cell *matCellDef="let row">
                <mat-chip-set>
                  <mat-chip [ngClass]="getCategoryClass(row.category)">{{row.category}}</mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="estimatedHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Hours </th>
              <td mat-cell *matCellDef="let row"> {{row.estimatedHours}}h </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let row">
                <span class="status-badge" [ngClass]="getStatusClass(row.status)">{{row.status}}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="itemMenu" class="hide-mobile">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #itemMenu="matMenu">
                   <button mat-menu-item (click)="deleteItem(row)"><mat-icon color="warn">delete</mat-icon>Delete</button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="item-row"></tr>
          </table>

          <div *ngIf="dataSource.data.length === 0" class="empty-state">
            <mat-icon>inbox</mat-icon>
            <p>No backlog items found.</p>
          </div>
        </div>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" aria-label="Select page of items"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .backlog-page { padding: 32px; height: calc(100vh - 64px); display: flex; flex-direction: column; box-sizing: border-box; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header-main h1 { margin: 0; font-size: 1.75rem; font-weight: 700; }
    .header-main .subtitle { margin: 0; color: var(--text-secondary); }
    
    .table-card { flex: 1; display: flex; flex-direction: column; border: none; border-radius: 12px; overflow: hidden; }
    .filters-row { padding: 16px 24px; display: flex; gap: 16px; align-items: center; border-bottom: 1px solid var(--surface-border); }
    .search-field { flex: 2; }
    .category-field { flex: 1; }
    
    .table-container { flex: 1; overflow: auto; position: relative; }
    table { width: 100%; }
    .title-cell { padding: 8px 0; }
    .main-title { font-weight: 600; color: var(--text-color); margin-bottom: 2px; }
    .title-cell .subtitle { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.2; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge-backlog { background: #edf2f7; color: #4a5568; }
    .badge-planned { background: rgba(66, 153, 225, 0.15); color: #2b6cb0; }
    .badge-inprogress { background: rgba(237, 137, 54, 0.15); color: #c05621; }
    .badge-completed { background: rgba(72, 187, 120, 0.15); color: #276749; }
    
    .chip-client { background: #ebf8ff !important; color: #2b6cb0 !important; }
    .chip-techdebt { background: #faf5ff !important; color: #6b46c1 !important; }
    .chip-rnd { background: #fffaf0 !important; color: #c05621 !important; }
    
    .empty-state { padding: 48px; text-align: center; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; margin-bottom: 8px; }
    
    .item-row:hover { background: rgba(0,0,0,0.02); }
  `]
})
export class BacklogListComponent implements OnInit {
  private backlogService = inject(BacklogService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['title', 'category', 'estimatedHours', 'status', 'actions'];
  dataSource = new MatTableDataSource<BacklogItem>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchControl = new FormControl('');
  categoryControl = new FormControl<string[]>([]);
  categories = [Category.Client, Category.TechDebt, Category.RnD];

  ngOnInit() {
    this.loadBacklog();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
    });

    this.categoryControl.valueChanges.subscribe(selectedCats => {
      this.applyFilters();
    });
  }

  loadBacklog() {
    this.backlogService.getAll().subscribe({
      next: (items) => {
        this.dataSource.data = items;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (_) => this.notificationService.error('Failed to load backlog items')
    });
  }

  applyFilters() {
    const search = (this.searchControl.value || '').toLowerCase();
    const categories = this.categoryControl.value || [];

    // Custom filtering logic if needed besides standard mat-table filter
    // For now we'll stick to a simple combined filter string or use a custom filterPredicate
    this.dataSource.filterPredicate = (data: BacklogItem, filter: string) => {
      const matchSearch = data.title.toLowerCase().includes(search) || (data.description || '').toLowerCase().includes(search);
      const matchCategory = categories.length === 0 || categories.includes(data.category);
      return matchSearch && matchCategory;
    };
    
    // Trigger filter
    this.dataSource.filter = Math.random().toString(); 
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateBacklogDialogComponent, { width: '500px' });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.backlogService.create(result).subscribe({
          next: () => {
            this.notificationService.success('Backlog item created successfully');
            this.loadBacklog();
          },
          error: () => this.notificationService.error('Failed to create item')
        });
      }
    });
  }

  deleteItem(item: BacklogItem) {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      this.backlogService.delete(item.id).subscribe({
        next: () => {
          this.notificationService.success('Item deleted');
          this.loadBacklog();
        },
        error: () => this.notificationService.error('Failed to delete item')
      });
    }
  }

  getCategoryClass(category: any) {
    if (!category) return 'chip-default';
    const catStr = category.toString().toLowerCase().replace(' ', '');
    return `chip-${catStr}`;
  }

  getStatusClass(status: any) {
    if (!status) return 'badge-default';
    return `badge-${status.toString().toLowerCase()}`;
  }
}
