import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface City {
  id: number;
  name: string;
  state: string;
}

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private apiUrl = `${environment.apiUrl}/City`;

  constructor(private http: HttpClient) {}

  addCity(city: City): Observable<City> {
    if (!city.name || city.name.trim().length === 0) {
      return throwError(() => new Error('O nome da cidade é obrigatório.'));
    }
    if (city.name.length > 100) {
      return throwError(
        () => new Error('O nome da cidade deve ter no máximo 100 caracteres.')
      );
    }
    if (!city.state || city.state.trim().length === 0) {
      return throwError(() => new Error('O estado (UF) é obrigatório.'));
    }
    if (city.state.length !== 2) {
      return throwError(
        () => new Error('O estado (UF) deve ter exatamente 2 caracteres.')
      );
    }

    const cityDto = {
      Id: city.id,
      Name: city.name,
      State: city.state,
    };
    return this.http.post<City>(this.apiUrl, cityDto).pipe(
      catchError((err) => {
        if (err.status === 409) {
          return throwError(() => new Error('Essa cidade já está cadastrada.'));
        }
        if (err.status === 400) {
          return throwError(() => new Error(err.error));
        }
        return throwError(() => new Error('Erro ao adicionar cidade.'));
      })
    );
  }

  getAllCities(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }

  removeCity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        if (err.status === 404) {
          return throwError(() => new Error('Cidade não encontrada.'));
        }
        return throwError(() => new Error('Erro ao remover cidade.'));
      })
    );
  }
}
