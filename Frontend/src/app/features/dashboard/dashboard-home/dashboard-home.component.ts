import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { PlanningService } from '../../../core/services/planning.service';
import { ActionCardComponent } from '../../../shared/components/action-card/action-card.component';
import { NotificationService } from '../../../core/services/notification.service';
import { WeeklyPlan } from '../../../core/models/planning';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    ActionCardComponent
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  authService = inject(AuthService);
  private planningService = inject(PlanningService);
  private notificationService = inject(NotificationService);

  activePlan = signal<WeeklyPlan | null>(null);

  ngOnInit() {
    this.loadActivePlan();
  }

  loadActivePlan() {
    this.planningService.getCurrentPlan().subscribe(plan => {
      this.activePlan.set(plan);
    });
  }

  onDownloadData() {
    this.notificationService.info('Exporting your workspace data...');
  }

  onLoadData() {
    this.notificationService.info('Select a configuration file to load.');
  }

  onSeedSample() {
    this.notificationService.success('Sample data generated successfully!');
  }

  onResetApp() {
    this.notificationService.info('Application state has been reset.');
  }
}
