import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Category, BacklogItem } from '../../../core/models/backlog';

@Component({
  selector: 'app-backlog-item-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Backlog Item' : 'Create New Backlog Item' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="itemForm" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="e.g. Implement Login Flow">
          <mat-error *ngIf="itemForm.get('title')?.hasError('required')">Title is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option [value]="Category.Client">Client Focused</mat-option>
            <mat-option [value]="Category.TechDebt">Tech Debt</mat-option>
            <mat-option [value]="Category.RnD">R&D</mat-option>
          </mat-select>
          <mat-error *ngIf="itemForm.get('category')?.hasError('required')">Category is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estimated Hours</mat-label>
          <input matInput type="number" formControlName="estimatedHours">
          <mat-error *ngIf="itemForm.get('estimatedHours')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="itemForm.get('estimatedHours')?.hasError('min')">Must be at least 1</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description (Optional)</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="itemForm.invalid" (click)="onSave()">
        {{ isEdit ? 'Save Changes' : 'Create Item' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class BacklogItemDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BacklogItemDialogComponent>);
  public data = inject<BacklogItem>(MAT_DIALOG_DATA, { optional: true });

  Category = Category;
  isEdit = false;

  itemForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: [Category.Client, Validators.required],
    estimatedHours: [8, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    if (this.data) {
      this.isEdit = true;
      this.itemForm.patchValue({
        title: this.data.title,
        description: this.data.description,
        category: this.data.category,
        estimatedHours: this.data.estimatedHours
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.itemForm.valid) {
      this.dialogRef.close(this.itemForm.value);
    }
  }
}
