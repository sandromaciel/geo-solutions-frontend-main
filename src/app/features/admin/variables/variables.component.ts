import { Component, OnInit, signal } from '@angular/core';
import { catchError, forkJoin, take } from 'rxjs';

import {
  Accommodation,
  Confrontation,
  Displacement,
  StartingPoint,
  VariableConfig,
  VariableType,
} from './models/variables.model';
import { AccommodationService } from './services/accommodation.service';
import { ConfrontationService } from './services/confrontation.service';
import { DisplacementService } from './services/displacement.service';
import { StartingPointService } from './services/starting-point.service';
import { VariableCardComponent } from './components/variable-card/variable-card.component';

@Component({
  selector: 'app-variables',
  standalone: true,
  imports: [VariableCardComponent],
  templateUrl: './variables.component.html',
})
export class VariablesComponent implements OnInit {
  public configs = signal<Record<VariableType, VariableConfig[]>>({
    [VariableType.ACCOMODATION]: [],
    [VariableType.DISPLACEMENT]: [],
    [VariableType.CONFRONTATION]: [],
    [VariableType.STARTING_POINT]: [],
  });

  public variableType = VariableType;

  constructor(
    private readonly accomodationService: AccommodationService,
    private readonly confrontationService: ConfrontationService,
    private readonly displacementService: DisplacementService,
    private readonly startingPointService: StartingPointService
  ) {}

  public getService(type: VariableType) {
    return {
      [VariableType.ACCOMODATION]: this.accomodationService,
      [VariableType.DISPLACEMENT]: this.displacementService,
      [VariableType.CONFRONTATION]: this.confrontationService,
      [VariableType.STARTING_POINT]: this.startingPointService,
    }[type];
  }

  public fetchConfigs() {
    forkJoin([
      this.confrontationService.getAll(),
      this.displacementService.getAll(),
      this.accomodationService.getAll(),
      this.startingPointService.getAll(),
    ])
      .pipe(
        catchError((error) => {
          console.error('Error fetching configs:', error);
          return [];
        })
      )
      .subscribe((responses) => {
        const [confrontation, displacement, accomodation, starting_point] =
          responses;

        this.configs.set({
          [VariableType.ACCOMODATION]: accomodation,
          [VariableType.DISPLACEMENT]: displacement,
          [VariableType.CONFRONTATION]: confrontation,
          [VariableType.STARTING_POINT]: starting_point,
        });
      });
  }

  public handleDeleteConfig(type: VariableType, id: string) {
    const service = this.getService(type);

    if (!service) {
      console.error('Serviço não existe para este tipo:', type);
      return;
    }

    service
      .delete(id)
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Erro ao excluir configuração', error);
          return [];
        })
      )
      .subscribe(this.fetchConfigs.bind(this));
  }

  public handleAddConfig(type: VariableType, config: VariableConfig) {
    const service = this.getService(type);

    if (!service) {
      console.error('Serviço não existe para este tipo:', type);
      return;
    }

    const { id, ...payload } = config;

    service
      .add(
        payload as Accommodation & Confrontation & Displacement & StartingPoint
      )
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Erro ao adicionar configuração', error);
          return [];
        })
      )
      .subscribe(this.fetchConfigs.bind(this));
  }

  public handleEditConfig(type: VariableType, config: VariableConfig) {
    const service = this.getService(type);

    if (!service) {
      console.error('Serviço não existe para este tipo:', type);
      return;
    }

    service
      .edit(
        config as Accommodation & Confrontation & Displacement & StartingPoint
      )
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Erro ao editar configuração: ', error);
          return [];
        })
      )
      .subscribe(this.fetchConfigs.bind(this));
  }

  public ngOnInit(): void {
    this.fetchConfigs();
  }
}
