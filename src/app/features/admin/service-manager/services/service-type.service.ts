import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceType } from '../models/service-type.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServiceTypeService {
  constructor(private readonly http: HttpClient) {}

  public findAll(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${environment.apiUrl}/ServiceType`);
  }

  public save(payload: ServiceType): Observable<ServiceType> {
    return this.http.post<ServiceType>(
      `${environment.apiUrl}/ServiceType`,
      payload
    );
  }

  public update(payload: ServiceType): Observable<ServiceType> {
    return this.http.put<ServiceType>(
      `${environment.apiUrl}/ServiceType/${payload.id}`,
      payload
    );
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/ServiceType/${id}`);
  }
}
