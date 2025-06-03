import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { VariableConfig } from '../models/variables.model';

export abstract class BaseVariableService<T extends VariableConfig> {
  constructor(protected http: HttpClient, private endpoint: string) {}

  public getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.endpoint);
  }

  public add(config: T): Observable<void> {
    return this.http.post<void>(this.endpoint, config);
  }

  public edit(config: T): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${config.id}`, config);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
