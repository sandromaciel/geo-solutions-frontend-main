import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { AuthRequest, AuthResponse, DecodedToken } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'auth_token';
  private readonly userSubject = new BehaviorSubject<string | null>(
    this.getToken()
  );
  public readonly usernameSubject = new BehaviorSubject<string | null>(
    this.getUsernameFromToken()
  );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.userSubject.next(token);
  }

  public saveToken(token: string): void {
    this.setToken(token);
  }

  public signin(userData: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/Users/login`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.jwtToken) {
            this.setToken(response.jwtToken);
          }
        })
      );
  }

  public autoLogin(): void {
    const token = this.getToken();

    if (token) {
      this.userSubject.next(token);
    }
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);

    this.userSubject.next(null);
    this.router.navigate(['/auth']);
  }

  public getDecodedJwt(): {
    role: string;
    nameid: string;
    username: string;
  } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<{ role: string; nameid: string; username: string }>(
        token
      );
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const isValid = decoded.exp * 1000 > Date.now();
      return isValid;
    } catch {
      return false;
    }
  }

  public getUserRole(): string | null {
    return this.getDecodedJwt()?.role || null;
  }

  public getUsername(): string | null {
    return this.getDecodedJwt()?.username || null;
  }

  public isAdmin(): boolean {
    return this.getUserRole()?.toLowerCase() === 'admin';
  }

  private getUsernameFromToken(): string | null {
    const decodedJwt = this.getDecodedJwt();
    return decodedJwt?.username || null;
  }

  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = jwtDecode<DecodedToken>(token);

    // `nameid` está como string — convertendo para número
    const userId = Number(decoded.nameid);
    return isNaN(userId) ? null : userId;
  }
}
