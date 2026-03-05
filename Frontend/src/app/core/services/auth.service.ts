import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, User, Role } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'wp_auth';
  private readonly API_URL = 'http://localhost:5174/api/auth';
  private readonly USER_API_URL = 'http://localhost:5174/api/User';

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  isTeamLead = computed(() => this.currentUser()?.role === Role.TeamLead);

  constructor(private http: HttpClient, private router: Router) {
    this.loadStorage();
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.setAuth(response))
    );
  }

  register(user: any) {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, user).pipe(
      tap(response => this.setAuth(response))
    );
  }

  logout() {
    localStorage.removeItem(this.AUTH_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    const data = localStorage.getItem(this.AUTH_KEY);
    return data ? JSON.parse(data).token : null;
  }

  private setAuth(response: AuthResponse) {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(response));
    this.currentUser.set(response.user);
  }

  private loadStorage() {
    const data = localStorage.getItem(this.AUTH_KEY);
    if (data) {
      const auth = JSON.parse(data) as AuthResponse;
      this.currentUser.set(auth.user);
    }
  }
}
