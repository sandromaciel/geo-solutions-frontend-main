import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Register } from '../models/register.model';

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  cell: string;
  userType: number;
}

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private readonly http: HttpClient) {}

  public register(body: Register): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/Users`, body);
  }
}