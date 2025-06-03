import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Intention } from '../models/intention.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IntentionService {
  constructor(private readonly http: HttpClient) {}

  public findAll(): Observable<Intention[]> {
    return this.http.get<Intention[]>(`${environment.apiUrl}/IntentionService`);
  }

  public save(payload: Intention): Observable<Intention> {
    return this.http.post<Intention>(
      `${environment.apiUrl}/IntentionService`,
      payload
    );
  }

  public update(payload: Intention): Observable<Intention> {
    return this.http.put<Intention>(
      `${environment.apiUrl}/IntentionService/${payload.id}`,
      payload
    );
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/IntentionService/${id}`
    );
  }
}
