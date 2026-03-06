import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/User`;

  getMembers() {
    return this.http.get<User[]>(`${this.API_URL}/members`);
  }

  registerMember(user: any) {
    return this.http.post<User>(`${this.API_URL}/members`, user);
  }

  deleteMember(id: string) {
    return this.http.delete(`${this.API_URL}/members/${id}`);
  }
}
