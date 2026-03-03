import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PlanningService } from '../../../core/services/planning.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planning-setup',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatSliderModule, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="planning-page">
      <header class="page-header">
        <h1>Weekly Strategic Planning</h1>
        <p class="subtitle">Set the team budget for the upcoming week</p>
      </header>

      <mat-card class="setup-card">
        <mat-card-header>
          <mat-card-title>Strategic Allocation</mat-card-title>
          <mat-card-subtitle>The total must equal 100% (currently {{ total() }}%)</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="allocation-content">
          <form [formGroup]="planningForm" class="sliders-form">
            <div class="slider-group">
              <div class="slider-header">
                <span class="label">Client Focused</span>
                <span class="value">{{ planningForm.get('client')?.value }}%</span>
              </div>
              <mat-slider min="0" max="100" step="5" discrete>
                <input matSliderThumb formControlName="client">
              </mat-slider>
              <p class="desc">New features, maintenance, and support for end-users.</p>
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span class="label">Tech Debt</span>
                <span class="value">{{ planningForm.get('techDebt')?.value }}%</span>
              </div>
              <mat-slider min="0" max="100" step="5" discrete>
                <input matSliderThumb formControlName="techDebt">
              </mat-slider>
               <p class="desc">Refactoring, performance improvements, and bug fixing.</p>
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span class="label">Research & Development</span>
                <span class="value">{{ planningForm.get('rnd')?.value }}%</span>
              </div>
              <mat-slider min="0" max="100" step="5" discrete>
                <input matSliderThumb formControlName="rnd">
              </mat-slider>
               <p class="desc">Innovation, proof of concepts, and learning.</p>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <div class="total-status" [ngClass]="{'valid': total() === 100, 'invalid': total() !== 100}">
            <mat-icon>{{ total() === 100 ? 'check_circle' : 'error' }}</mat-icon>
            <span>Total: {{ total() }}%</span>
          </div>
          <button mat-flat-button color="primary" 
                  [disabled]="total() !== 100 || isLoading" 
                  (click)="onStartPlanning()">
            Open Planning Board
          </button>
        </mat-card-actions>
      </mat-card>

      <section class="instructions">
        <h3>How it works</h3>
        <ol>
          <li>Set the percentage of the team's total capacity (30h per person) for each category.</li>
          <li>Once opened, team members can assign themselves to backlog items within these budgets.</li>
          <li>The strategy cannot be changed once the week is frozen.</li>
        </ol>
      </section>
    </div>
  `,
  styles: [`
    .planning-page { padding: 32px; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; text-align: center; }
    .page-header h1 { margin: 0; font-size: 2rem; font-weight: 800; color: var(--text-color); }
    .page-header .subtitle { color: var(--text-secondary); margin: 8px 0 0; }
    
    .setup-card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .allocation-content { padding: 24px 32px !important; }
    
    .sliders-form { display: flex; flex-direction: column; gap: 32px; }
    .slider-group { display: flex; flex-direction: column; }
    .slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .slider-header .label { font-weight: 600; color: var(--text-color); }
    .slider-header .value { font-weight: 700; color: var(--primary-color); font-size: 1.125rem; }
    .slider-group .desc { margin: 8px 0 0; font-size: 0.8125rem; color: var(--text-secondary); }
    
    mat-slider { width: 100%; }
    
    .total-status { display: flex; align-items: center; gap: 8px; margin-right: 24px; font-weight: 600; }
    .total-status.valid { color: #48bb78; }
    .total-status.invalid { color: #f56565; }
    
    mat-card-actions { padding: 24px 32px !important; background: rgba(0,0,0,0.01); }
    
    .instructions { margin-top: 48px; color: var(--text-secondary); }
    .instructions h3 { font-size: 1rem; font-weight: 600; color: var(--text-color); margin-bottom: 12px; }
    .instructions ol { padding-left: 20px; font-size: 0.875rem; line-height: 1.6; }
    .instructions li { margin-bottom: 8px; }
  `]
})
export class PlanningSetupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private planningService = inject(PlanningService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  planningForm = this.fb.group({
    client: [40],
    techDebt: [30],
    rnd: [30]
  });

  isLoading = false;

  ngOnInit() {
    this.planningService.getCurrentPlan().subscribe(plan => {
      if (plan) {
        this.planningForm.patchValue({
          client: plan.clientPercentage,
          techDebt: plan.techDebtPercentage,
          rnd: plan.rndPercentage
        });
      }
    });
  }

  total() {
    const vals = this.planningForm.value;
    return (vals.client || 0) + (vals.techDebt || 0) + (vals.rnd || 0);
  }

  onStartPlanning() {
    if (this.total() === 100) {
      this.isLoading = true;
      const vals = this.planningForm.value;
      
      const payload = {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        clientPercentage: vals.client!,
        techDebtPercentage: vals.techDebt!,
        rndPercentage: vals.rnd!
      };

      this.planningService.createPlan(payload).subscribe({
        next: (plan) => {
          this.notificationService.success('Weekly strategy set! Proceeding to assignments.');
          this.router.navigate(['/assignment']);
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Failed to initialize planning week.');
        }
      });
    }
  }
}
