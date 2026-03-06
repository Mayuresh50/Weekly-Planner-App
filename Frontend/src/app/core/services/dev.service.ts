import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/dev`;

  seed(): Observable<any> {
    return this.http.post(`${this.API_URL}/seed`, {});
  }

  reset(): Observable<any> {
    return this.http.post(`${this.API_URL}/reset`, {});
  }

  export(): Observable<any> {
    return this.http.get(`${this.API_URL}/export`);
  }

  import(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/import`, data);
  }
}
