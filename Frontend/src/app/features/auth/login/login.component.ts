import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
      <h2 class="form-title">Login</h2>
      <p class="form-subtitle">Use your credentials to access the planner</p>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email Address</mat-label>
        <input matInput formControlName="email" type="email" placeholder="email@example.com">
        <mat-icon matSuffix>email</mat-icon>
        <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
        <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email address</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
        <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
      </mat-form-field>

      <div class="actions">
        <button mat-flat-button color="primary" class="full-width login-btn" [disabled]="loginForm.invalid || isLoading">
          <span *ngIf="!isLoading">Sign In</span>
          <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
        </button>
      </div>
      
      <div class="test-creds">
        <p><strong>Dev Note:</strong> Use any valid email/password (mocked backend).</p>
      </div>
    </form>
  `,
  styles: [`
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
      text-align: center;
    }
    .form-subtitle {
      margin: -8px 0 16px;
      color: var(--text-secondary);
      text-align: center;
      font-size: 0.875rem;
    }
    .full-width { width: 100%; }
    .login-btn {
      height: 48px;
      font-weight: 600;
      font-size: 1rem;
    }
    .actions { margin-top: 8px; }
    .test-creds {
      margin-top: 24px;
      padding: 12px;
      background: var(--surface-ground);
      border-radius: 8px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-align: center;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  hidePassword = true;
  isLoading = false;

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login({ email: email!, password: password! })
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.notificationService.success('Successfully logged in!');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error(err);
            this.notificationService.error('Login failed. Please check your credentials.');
          }
        });
    }
  }
}
