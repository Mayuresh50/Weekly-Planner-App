import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { AuthService } from '../../../core/services/auth.service';
import { BacklogItem, Category } from '../../../core/models/backlog';
import { BacklogItemDialogComponent } from './backlog-item-dialog.component';
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
      <header class="dashboard-header">
        <div class="title-group">
          <h1>Product Backlog</h1>
          <p class="subtitle">Prioritize and manage your team's upcoming deliverables</p>
        </div>
        <div class="header-actions" *ngIf="authService.isTeamLead()">
          <button mat-flat-button color="primary" class="action-btn" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            <span>Create Item</span>
          </button>
        </div>
      </header>

      <mat-card class="data-box table-card">
        <div class="filters-bar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" [formControl]="searchControl" placeholder="Find tasks by title or description...">
          </div>
          
          <div class="filter-actions">
            <mat-form-field appearance="outline" class="category-select">
              <mat-label>All Categories</mat-label>
              <mat-select [formControl]="categoryControl" multiple>
                <mat-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="table-outer">
          <table mat-table [dataSource]="dataSource" matSort class="enterprise-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Work Item </th>
              <td mat-cell *matCellDef="let row"> 
                <div class="work-item-cell">
                  <div class="item-icon" [attr.data-category]="row.category">
                    <mat-icon>{{ getCategoryIcon(row.category) }}</mat-icon>
                  </div>
                  <div class="item-details">
                    <span class="item-name">{{row.title}}</span>
                    <span class="item-desc">{{row.description | slice:0:80}}{{row.description?.length > 80 ? '...' : ''}}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Category </th>
              <td mat-cell *matCellDef="let row">
                <span class="cat-pill" [attr.data-category]="row.category">
                  {{row.category}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="estimatedHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Budget </th>
              <td mat-cell *matCellDef="let row" class="hours-col"> 
                <span class="hour-tag">{{row.estimatedHours}}h</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Lifecycle </th>
              <td mat-cell *matCellDef="let row">
                <span class="lifecycle-badge" [attr.data-status]="row.status">
                  {{row.status}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row" class="actions-col">
                <button mat-icon-button [matMenuTriggerFor]="itemMenu" class="more-btn" *ngIf="authService.isTeamLead()">
                  <mat-icon>more_horiz</mat-icon>
                </button>
                <mat-menu #itemMenu="matMenu" class="enterprise-menu">
                   <button mat-menu-item (click)="editItem(row)">
                     <mat-icon color="primary">edit</mat-icon>
                     <span>Edit Details</span>
                   </button>
                   <button mat-menu-item (click)="deleteItem(row)">
                     <mat-icon color="warn">delete_outline</mat-icon>
                     <span>Archive Item</span>
                   </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="interactive-row"></tr>
          </table>

          <div *ngIf="dataSource.data.length === 0" class="empty-view">
            <div class="empty-illustration">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <h3>No items in backlog</h3>
            <p>Ready to start something new? Create your first backlog item.</p>
          </div>
        </div>
        
        <mat-paginator [pageSizeOptions]="[12, 24, 48]" class="enterprise-paginator"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .backlog-page { animation: fadeIn 0.4s ease-out; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding: 0 4px;
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

    /* DATA BOX & FILTERS */
    .data-box { 
      border: none; 
      border-radius: 24px; 
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
      background: white;
      overflow: hidden;
    }

    .filters-bar {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      background: #fafafa;
      border-bottom: 1px solid #f1f5f9;
    }

    .search-box {
      flex: 1;
      max-width: 500px;
      position: relative;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      transition: all 0.2s;
    }

    .search-box:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .search-box mat-icon { color: #94a3b8; margin-right: 12px; font-size: 20px; width: 20px; height: 20px; }
    .search-box input {
      border: none;
      background: transparent;
      height: 44px;
      width: 100%;
      outline: none;
      font-size: 0.95rem;
      color: #1e293b;
    }

    .category-select { width: 220px; margin-bottom: -1.25em; }

    /* TABLE STYLES */
    .table-outer { min-height: 400px; }
    .enterprise-table { width: 100%; background: transparent; }
    
    .work-item-cell { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
    .item-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .item-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    
    .item-icon[data-category="Client"] { background: #eff6ff; color: #3b82f6; }
    .item-icon[data-category="TechDebt"] { background: #f0fdf4; color: #22c55e; }
    .item-icon[data-category="RnD"] { background: #fffbeb; color: #f59e0b; }

    .item-details { display: flex; flex-direction: column; gap: 2px; }
    .item-name { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
    .item-desc { font-size: 0.8rem; color: #64748b; }

    .cat-pill {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .cat-pill[data-category="Client"] { background: #e0f2fe; color: #0369a1; }
    .cat-pill[data-category="TechDebt"] { background: #dcfce7; color: #15803d; }
    .cat-pill[data-category="RnD"] { background: #fef3c7; color: #b45309; }

    .hour-tag {
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 10px;
      font-weight: 700;
      color: #334155;
      font-size: 0.85rem;
    }

    .lifecycle-badge {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid transparent;
    }
    .lifecycle-badge[data-status="Backlog"] { background: #f8fafc; color: #64748b; border-color: #e2e8f0; }
    .lifecycle-badge[data-status="Planned"] { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
    .lifecycle-badge[data-status="InProgress"] { background: #fff7ed; color: #ea580c; border-color: #ffedd5; }
    .lifecycle-badge[data-status="Completed"] { background: #f0fdf4; color: #16a34a; border-color: #dcfce7; }

    .actions-col { text-align: right; padding-right: 24px !important; }
    .more-btn { color: #94a3b8; }
    .more-btn:hover { color: #1e293b; background: #f1f5f9; }

    .interactive-row:hover { background: #f8fafc; cursor: pointer; }
    
    /* EMPTY STATE */
    .empty-view {
      padding: 100px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-illustration {
      width: 80px;
      height: 80px;
      background: #f1f5f9;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .empty-illustration mat-icon { font-size: 40px; width: 40px; height: 40px; color: #cbd5e1; }
    .empty-view h3 { margin: 0; font-weight: 700; color: #1e293b; }
    .empty-view p { color: #64748b; margin-top: 8px; }

    .enterprise-paginator { border-top: 1px solid #f1f5f9; background: #fafafa; }
  `]
})
export class BacklogListComponent implements OnInit {
  private backlogService = inject(BacklogService);
  private notificationService = inject(NotificationService);
  public authService = inject(AuthService);
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

    this.dataSource.filterPredicate = (data: BacklogItem, filter: string) => {
      const matchSearch = data.title.toLowerCase().includes(search) || (data.description || '').toLowerCase().includes(search);
      const matchCategory = categories.length === 0 || categories.includes(data.category);
      return matchSearch && matchCategory;
    };
    
    this.dataSource.filter = Math.random().toString(); 
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(BacklogItemDialogComponent, { width: '500px' });
    
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

  editItem(item: BacklogItem) {
    const dialogRef = this.dialog.open(BacklogItemDialogComponent, { 
      width: '500px',
      data: item
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.backlogService.update(item.id, result).subscribe({
          next: () => {
            this.notificationService.success('Backlog item updated successfully');
            this.loadBacklog();
          },
          error: () => this.notificationService.error('Failed to update item')
        });
      }
    });
  }

  deleteItem(item: BacklogItem) {
    if (confirm(`Are you sure you want to archive "${item.title}"?`)) {
      this.backlogService.delete(item.id).subscribe({
        next: () => {
          this.notificationService.success('Item archived');
          this.loadBacklog();
        },
        error: () => this.notificationService.error('Failed to archive item')
      });
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case Category.Client: return 'business_center';
      case Category.TechDebt: return 'build';
      case Category.RnD: return 'biotech';
      default: return 'label';
    }
  }
}
