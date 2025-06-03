import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
}

@Injectable({
  providedIn: 'root',
})
export class ViaCepService {
  private baseUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  getCityIbgeIdByCep(cep: string): Observable<number | null> {
    const sanitizedCep = cep.replace(/\D/g, '');

    if (sanitizedCep.length !== 8) {
      return of(null);
    }

    return this.http
      .get<ViaCepResponse>(`${this.baseUrl}/${sanitizedCep}/json`)
      .pipe(
        map((response) => {
          if (!response || response.ibge === undefined) {
            return null;
          }
          return parseInt(response.ibge, 10);
        }),
        catchError((error) => {
          console.error('Erro ao consultar ViaCEP:', error);
          return of(null);
        })
      );
  }
}
