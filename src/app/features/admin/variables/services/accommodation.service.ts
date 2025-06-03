import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseVariableService } from './base-variable.service';
import { Accommodation } from '../models/variables.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccommodationService extends BaseVariableService<Accommodation> {
  constructor(protected override readonly http: HttpClient) {
    super(http, `${environment.apiUrl}/Hosting`);
  }
}
