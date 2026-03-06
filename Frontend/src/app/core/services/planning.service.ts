import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WeeklyPlan, CreateWeeklyPlan } from '../models/planning';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private readonly API_URL = `${environment.apiBaseUrl}/planning`;

  constructor(private http: HttpClient) {}

  getCurrentPlan() {
    return this.http.get<WeeklyPlan>(`${this.API_URL}/current`);
  }

  createPlan(plan: CreateWeeklyPlan) {
    return this.http.post<WeeklyPlan>(this.API_URL, plan);
  }

  freezePlan(id: string) {
    return this.http.post<WeeklyPlan>(`${this.API_URL}/${id}/freeze`, {});
  }
}
