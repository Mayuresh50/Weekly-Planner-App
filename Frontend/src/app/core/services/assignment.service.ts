import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TaskAssignment, CreateAssignment, DashboardSummary } from '../models/assignment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly API_URL = 'http://localhost:5174/api/assignment';

  constructor(private http: HttpClient) {}

  assignTask(assignment: CreateAssignment) {
    return this.http.post<TaskAssignment>(this.API_URL, assignment);
  }

  updateProgress(id: string, progressPercentage: number) {
    return this.http.patch<TaskAssignment>(`${this.API_URL}/${id}/progress`, progressPercentage);
  }

  getDashboardSummary(weeklyPlanId: string, filters: any = {}) {
    let params = new HttpParams();
    if (filters.memberId) params = params.set('memberId', filters.memberId);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<DashboardSummary>(`${this.API_URL}/${weeklyPlanId}/summary`, { params });
  }
}
