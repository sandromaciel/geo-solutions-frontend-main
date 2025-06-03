import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface UF {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

interface Mesorregiao {
  id: number;
  nome: string;
  UF: UF;
}

interface Microrregiao {
  id: number;
  nome: string;
  mesorregiao: Mesorregiao;
}

interface IBGECity {
  id: number;
  nome: string;
  microrregiao: Microrregiao;
}

export interface City {
  id: number;
  name: string;
  state: string;
}

@Injectable({
  providedIn: 'root',
})
export class IbgeService {
  private baseApiUrl =
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

  constructor(private http: HttpClient) {}

  private normalizeString(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  searchCities(query: string, state: string = 'MG'): Observable<City[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    const apiUrl = `${this.baseApiUrl}/${state}/municipios`;

    return this.http.get<IBGECity[]>(apiUrl).pipe(
      map((cities) => {
        const normalizedQuery = this.normalizeString(query);

        return cities
          .filter((city) => {
            const cityName = city.nome || '';
            const normalizedCityName = this.normalizeString(cityName);
            return normalizedCityName.includes(normalizedQuery);
          })
          .map((city) => {
            const name = city.nome?.trim() || 'Desconhecido';
            const truncatedName =
              name.length > 100 ? name.substring(0, 100) : name;
            const stateSigla =
              city.microrregiao.mesorregiao.UF.sigla || 'Desconhecido';
            return {
              id: city.id || 0,
              name: truncatedName,
              state: stateSigla,
            };
          })
          .slice(0, 10);
      })
    );
  }
}
