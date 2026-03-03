import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BacklogItem, CreateBacklogItem } from '../models/backlog';

@Injectable({
  providedIn: 'root'
})
export class BacklogService {
  private readonly API_URL = 'http://localhost:5174/api/backlog';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<BacklogItem[]>(this.API_URL);
  }

  getById(id: string) {
    return this.http.get<BacklogItem>(`${this.API_URL}/${id}`);
  }

  create(item: CreateBacklogItem) {
    return this.http.post<BacklogItem>(this.API_URL, item);
  }

  update(id: string, item: Partial<BacklogItem>) {
    return this.http.put<BacklogItem>(`${this.API_URL}/${id}`, item);
  }

  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
