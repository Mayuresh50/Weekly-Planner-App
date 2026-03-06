import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="action-card" (click)="navigate()">
      <mat-card-content>
        <div class="icon-container">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <div class="text-content">
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </div>
        <div class="arrow-indicator">
          <mat-icon>chevron_right</mat-icon>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .action-card {
      height: 100%;
      cursor: pointer;
      border-radius: 20px;
      border: none;
      background: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      position: relative;
      overflow: hidden;
    }

    .action-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      background: #f8fafc;
    }

    mat-card-content {
      display: flex;
      align-items: center;
      padding: 24px !important;
      gap: 20px;
    }

    .icon-container {
      width: 56px;
      height: 56px;
      background: #eff6ff;
      color: #3b82f6;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .action-card:hover .icon-container {
      background: #3b82f6;
      color: white;
      transform: scale(1.1);
    }

    .icon-container mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .text-content {
      flex: 1;
    }

    .text-content h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }

    .text-content p {
      margin: 4px 0 0;
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.4;
    }

    .arrow-indicator {
      color: #cbd5e1;
      transition: transform 0.3s ease, color 0.3s ease;
    }

    .action-card:hover .arrow-indicator {
      transform: translateX(4px);
      color: #3b82f6;
    }
  `]
})
export class ActionCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) route!: string;

  constructor(private router: Router) {}

  navigate() {
    this.router.navigate([this.route]);
  }
}
