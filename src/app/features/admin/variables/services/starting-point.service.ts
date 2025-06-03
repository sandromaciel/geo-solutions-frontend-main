import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { StartingPoint } from '../models/variables.model';
import { BaseVariableService } from './base-variable.service';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StartingPointService extends BaseVariableService<StartingPoint> {
  constructor(protected override readonly http: HttpClient) {
    super(http, `${environment.apiUrl}/StartPoint`);
  }
}
