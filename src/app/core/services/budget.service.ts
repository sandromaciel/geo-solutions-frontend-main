import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BudgetRequest } from '../models/budget/request/budget.request.model';
import { BudgetResponse } from '../models/budget/budget.model';
import { RemovedItem } from '../models/removed.item.model';
import { CalcRequest } from '../models/budget/calcParameter/calc.request.model';
import { ServiceTypeBudget } from '../models/budget/serviceTypeBudget/service.Type.Budget.model';
import { AddressResponse } from '../models/budget/response/address.response.model';
import { CalcResponse } from '../models/budget/response/CalcResponse.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  constructor(private http: HttpClient) {}

  public getBudgetById(budgetId: string): Observable<BudgetResponse> {
    return this.http.get<BudgetResponse>(
      `${environment.apiUrl}/Budgets?budgetId=${budgetId}`
    );
  }

   getBudgetsByUserId(userId: string): Observable<BudgetResponse[]> {
    return new Observable<BudgetResponse[]>(observer => {
      this.getAllBudgets().subscribe({
        next: (budgets) => {
          const userBudgets = budgets.filter(budget => budget.user?.id === +userId);
          observer.next(userBudgets);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  public postBudget(budget: BudgetRequest): Observable<BudgetResponse> {
    return this.http.post<BudgetResponse>(
      `${environment.apiUrl}/Budgets`,
      budget
    );
  }

  public getAllBudgets(): Observable<BudgetResponse[]> {
    return this.http.get<BudgetResponse[]>(`${environment.apiUrl}/Budgets/All`);
  }

  public deleteBudget(budgetId: number): Observable<RemovedItem> {
    return this.http.delete<RemovedItem>(
      `${environment.apiUrl}/Budgets?budgetId=${budgetId}`
    );
  }

  public updateBudget(
    budgetId: number,
    budgetToUpdate: BudgetRequest
  ): Observable<BudgetResponse> {
    return this.http.put<BudgetResponse>(
      `${environment.apiUrl}/Budgets?budgetId=${budgetId}`,
      budgetToUpdate
    );
  }

  public processCalc(calcRequest: CalcRequest): Observable<CalcResponse> {
    return this.http.post<CalcResponse>(
      `${environment.apiUrl}/Budgets/calc`,
      calcRequest
    );
  }

  public getAllServiceTypes(): Observable<ServiceTypeBudget[]> {
    return this.http.get<ServiceTypeBudget[]>(
      `${environment.apiUrl}/ServiceType`
    );
  }

  public fetchAddressByCep(cep: string): Observable<AddressResponse> {
    return this.http.get<AddressResponse>(
      `${environment.apiUrl}/Budgets/address?cep=${cep}`
    );
  }

  public checkCityCoverageByIbge(ibgeId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${environment.apiUrl}/city/coverage?ibgeId=${ibgeId}`
    );
  }
}
