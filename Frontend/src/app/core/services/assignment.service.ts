import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TaskAssignment, CreateAssignment, DashboardSummary } from '../models/assignment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private readonly API_URL = 'http://localhost:5174/api/assignment';

  constructor(private http: HttpClient) {}

  // Create assignment
  assignTask(assignment: CreateAssignment) {
    return this.http.post<TaskAssignment>(this.API_URL, assignment);
  }

  // Update task progress
  updateProgress(id: string, progressPercentage: number) {
    const payload = {
      progressPercentage: progressPercentage
    };

    return this.http.patch<TaskAssignment>(
      `${this.API_URL}/${id}/progress`,
      payload
    );
  }

  // Dashboard summary
  getDashboardSummary(weeklyPlanId: string, filters: any = {}) {
    let params = new HttpParams();
    if (filters.memberId) {
      params = params.set('memberId', filters.memberId);
    }
    return this.http.get<DashboardSummary>(`${this.API_URL}/${weeklyPlanId}/summary`, { params });
  }

  getActiveDashboardSummary(filters: any = {}) {
    let params = new HttpParams();
    if (filters.memberId) {
      params = params.set('memberId', filters.memberId);
    }
    return this.http.get<DashboardSummary>(`${this.API_URL}/summary/active`, { params });
  }
}