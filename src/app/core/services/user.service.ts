import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChangePasswordDTO, UserDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/Users/${id}`);
  }

  updateUser(userData: Partial<UserDTO>): Observable<{ jwtToken: string }> {
    return this.http.put<{ jwtToken: string }>(
      `${this.apiUrl}/Users/edit-user`,
      userData
    );
  }

  changePassword(data: ChangePasswordDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Users/change-password`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Users/${id}`);
  }
}
