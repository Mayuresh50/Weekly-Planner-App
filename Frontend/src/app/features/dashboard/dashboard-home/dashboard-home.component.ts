import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { PlanningService } from '../../../core/services/planning.service';
import { ActionCardComponent } from '../../../shared/components/action-card/action-card.component';
import { NotificationService } from '../../../core/services/notification.service';
import { DevService } from '../../../core/services/dev.service';
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
  private devService = inject(DevService);

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
    this.devService.export().subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planner-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Data exported successfully!');
      },
      error: () => this.notificationService.error('Failed to export data')
    });
  }

  onLoadData(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const contents = e.target?.result as string;
          const data = JSON.parse(contents);
          this.devService.import(data).subscribe({
            next: () => {
              this.notificationService.success('Data imported successfully!');
              this.loadActivePlan();
            },
            error: (err) => this.notificationService.error(err.error?.message || 'Import failed')
          });
        } catch (ex) {
          this.notificationService.error('Invalid JSON file');
        }
      };
      reader.readAsText(fileList[0]);
    }
  }

  onSeedSample() {
    this.devService.seed().subscribe({
      next: () => {
        this.notificationService.success('Sample data seeded successfully!');
        this.loadActivePlan();
      },
      error: () => this.notificationService.error('Failed to seed sample data')
    });
  }

  onResetApp() {
    if (confirm('Are you sure you want to reset the application? All data will be lost.')) {
      this.devService.reset().subscribe({
        next: () => {
          this.notificationService.success('Application state has been reset.');
          this.loadActivePlan();
        },
        error: () => this.notificationService.error('Failed to reset application')
      });
    }
  }
}
