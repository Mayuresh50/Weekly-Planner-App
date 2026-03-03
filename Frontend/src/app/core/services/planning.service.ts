import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WeeklyPlan, CreateWeeklyPlan } from '../models/planning';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private readonly API_URL = 'http://localhost:5174/api/planning';

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
