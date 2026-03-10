import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Role } from './core/models/auth';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent) 
      },
      { 
        path: 'backlog', 
        loadComponent: () => import('./features/backlog/backlog-list/backlog-list.component').then(m => m.BacklogListComponent) 
      },
      { 
        path: 'planning', 
        loadComponent: () => import('./features/planning/planning-setup/planning-setup.component').then(m => m.PlanningSetupComponent),
        canActivate: [authGuard],
        data: { role: Role.TeamLead }
      },
      { 
        path: 'assignment', 
        loadComponent: () => import('./features/assignment/assignment-manager/assignment-manager.component').then(m => m.AssignmentManagerComponent) 
      },
      { 
        path: 'my-tasks', 
        loadComponent: () => import('./features/assignment/assignment-manager/assignment-manager.component').then(m => m.AssignmentManagerComponent) 
      },
      { 
        path: 'update-progress', 
        loadComponent: () => import('./features/assignment/assignment-manager/assignment-manager.component').then(m => m.AssignmentManagerComponent) 
      },
      {
        path: 'team',
        loadComponent: () => import('./features/team/team-list/team-list.component').then(m => m.TeamListComponent),
        canActivate: [authGuard],
        data: { role: Role.TeamLead }
      },
      {
        path: 'planning/current',
        loadComponent: () => import('./features/assignment/assignment-manager/assignment-manager.component').then(m => m.AssignmentManagerComponent)
      },
      {
        path: 'planning/history',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'weeks/history',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
