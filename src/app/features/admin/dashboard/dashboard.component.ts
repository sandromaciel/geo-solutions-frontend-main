import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';

import {
  FileText,
  MapPin,
  Pencil,
  Sliders,
  Settings,
  LucideAngularModule,
} from 'lucide-angular';
import { forkJoin, single, take } from 'rxjs';
import { ApexAxisChartSeries, NgApexchartsModule } from 'ng-apexcharts';

import { AuthService } from '../../../core/services/auth.service';
import { City, CityService } from '../regions/services/city.service';
import {
  Accommodation,
  Confrontation,
  Displacement,
  StartingPoint,
  VariableConfig,
  VariableType,
} from '../variables/models/variables.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BudgetService } from '../../../core/services/budget.service';
import { BudgetResponse } from '../../../core/models/budget/budget.model';
import { ServiceType } from '../service-manager/models/service-type.model';
import { DisplacementService } from '../variables/services/displacement.service';
import { ConfrontationService } from '../variables/services/confrontation.service';
import { AccommodationService } from '../variables/services/accommodation.service';
import { StartingPointService } from '../variables/services/starting-point.service';
import { ServiceTypeService } from '../service-manager/services/service-type.service';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    LucideAngularModule,
    ProgressSpinnerModule,

    DashboardCardComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public cities = signal<City[]>([]);
  public services = signal<ServiceType[]>([]);
  public variables = signal<VariableConfig[]>([]);
  public budgets = signal<BudgetResponse[]>([]);
  public isDataLoaded = signal(false);
  public allBudgets = signal<BudgetResponse[]>([]);

  public readonly icons = {
    pencil: Pencil,
    sliders: Sliders,
    mapPin: MapPin,
    settings: Settings,
    fileText: FileText,
  };
  chartSeries!: ApexAxisChartSeries;
  chartCategories!: string[];

  public get userName(): string {
    return this.authService.getUsername() || '';
  }

  constructor(
    private readonly authService: AuthService,
    private readonly citiesService: CityService,
    private readonly budgetService: BudgetService,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly displacementService: DisplacementService,
    private readonly accomodationService: AccommodationService,
    private readonly confrontationService: ConfrontationService,
    private readonly startingPointService: StartingPointService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  private fetchAllVariableConfiguration(): void {
    forkJoin([
      this.displacementService.getAll(),
      this.accomodationService.getAll(),
      this.confrontationService.getAll(),
      this.startingPointService.getAll(),
    ])
      .pipe(take(1))
      .subscribe(
        ([displacement, accommodation, confrontation, startingPoint]) => {
          this.variables.set([
            ...displacement.map((d) => ({
              ...d,
              type: VariableType.DISPLACEMENT,
            })),
            ...accommodation.map((a) => ({
              ...a,
              type: VariableType.ACCOMODATION,
            })),
            ...confrontation.map((c) => ({
              ...c,
              type: VariableType.CONFRONTATION,
            })),
            ...startingPoint.map((s) => ({
              ...s,
              type: VariableType.STARTING_POINT,
            })),
          ]);
        }
      );
  }

  private fetchCardsData(): void {
    forkJoin([
      this.citiesService.getAllCities(),
      this.serviceTypeService.findAll(),
    ])
      .pipe(take(1))
      .subscribe(([cities, serviceTypes]) => {
        this.cities.set(cities);
        this.services.set(serviceTypes);
      });
  }

  private convertToCurrency(value: number): string {
    return value.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  public getVariableMessageByType(config: VariableConfig): string {
    let data: VariableConfig;

    if (config.type === VariableType.STARTING_POINT) {
      data = config as StartingPoint;
      return `Início: ${data.street}, ${data.city}`;
    }
    if (config.type === VariableType.DISPLACEMENT) {
      data = config as Displacement;
      return `Deslocamento: ${data.areaMin} a ${data.areaMax} (x ${data.multiplier})`;
    }
    if (config.type === VariableType.ACCOMODATION) {
      data = config as Accommodation;

      return `Acomodação de ${data.distanteMin} a ${
        data.distanteMax
      }km - ${this.convertToCurrency(data.price)}`;
    }
    if (config.type === VariableType.CONFRONTATION) {
      data = config as Confrontation;
      return `Confrontação com preço: - Área:
        ${data.areaMin} a ${data.areaMax} / ${this.convertToCurrency(
        data.price
      )}`;
    }

    return '';
  }

  public chartData = signal<{
    categories: string[];
    series: { name: string; data: number[] };
  }>({
    categories: [],
    series: { name: 'Orçamentos', data: [] },
  });

private processBudgetData(): void {
  const monthlyCounts: { [key: string]: number } = {};

  this.budgets().forEach((budget) => {
    const date = new Date(budget.startDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01 a 12
    const key = `${year}-${month}`; // chave cronológica
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
  });

  // Ordenar as chaves cronologicamente
  const sortedKeys = Object.keys(monthlyCounts).sort();

  // Gerar labels formatadas e os dados
  const categories = sortedKeys.map((key) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  });

  const data = sortedKeys.map((key) => monthlyCounts[key]);

  this.chartData.set({
    categories,
    series: { name: 'Orçamentos', data },
  });
}

    public ngOnInit(): void {
      this.fetchCardsData();
      this.fetchAllVariableConfiguration();

      this.budgetService.getAllBudgets().subscribe((budgets: BudgetResponse[]) => {
      const sortedBudgets = budgets.sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      this.allBudgets.set(sortedBudgets); 
      this.budgets.set(sortedBudgets); 

      this.processBudgetData(); 

      const data = this.chartData(); 
      this.chartSeries = [data.series]; 
      this.chartCategories = data.categories;

      this.isDataLoaded.set(true);
    });
  }
}
