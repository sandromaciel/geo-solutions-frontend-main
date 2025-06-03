import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Confrontation } from '../models/variables.model';
import { BaseVariableService } from './base-variable.service';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfrontationService extends BaseVariableService<Confrontation> {
  constructor(protected override readonly http: HttpClient) {
    super(http, `${environment.apiUrl}/Confrontation`);
  }
}
