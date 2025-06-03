import { Router } from '@angular/router';
import { Component, OnInit, signal } from '@angular/core';

import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  LucideAngularModule,
} from 'lucide-angular';

import { take } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

import { Intention } from './models/intention.model';
import { ServiceType } from './models/service-type.model';
import { IntentionService } from './services/intention.service';
import { ServiceTypeService } from './services/service-type.service';
import { ServiceTypeFormComponent } from './components/service-type/service-type-form/service-type-form.component';
import { IntentionFormComponent } from './components/intention/intention-form/intention-form.component';

@Component({
  selector: 'app-service-manager',
  standalone: true,
  imports: [LucideAngularModule, ConfirmPopupModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './service-manager.component.html',
})
export class ServiceManagerComponent implements OnInit {
  public readonly services = signal<ServiceType[]>([]);
  public readonly intentions = signal<Intention[]>([]);

  public readonly intentionsByServiceType = signal<Record<string, Intention[]>>(
    {}
  );

  public readonly icons = {
    plus: Plus,
    pencil: Pencil,
    trash: Trash2,
    chevronDown: ChevronDown,
  };

  constructor(
    private readonly router: Router,
    private readonly dialogService: DialogService,
    private readonly intentionService: IntentionService,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly confirmationService: ConfirmationService
  ) {}

  private fetchIntentions(): void {
    this.intentionService.findAll().subscribe((response) => {
      this.intentions.set(response);

      const groupedIntentions = response.reduce((acc, intention) => {
        const serviceTypeId = intention.serviceTypeId;

        if (!acc[serviceTypeId]) {
          acc[serviceTypeId] = [];
        }

        acc[serviceTypeId].push(intention);

        return acc;
      }, {} as Record<string, Intention[]>);

      this.intentionsByServiceType.set(groupedIntentions);
    });
  }

  private fetchServiceTypes(): void {
    this.serviceTypeService.findAll().subscribe((response) => {
      this.services.set(response);
    });
  }

  private reloadPage(): void {
    this.ngOnInit();
  }

  public openIntentionFormModal(event: Event, intention?: Intention): void {
    this.dialogService.open(IntentionFormComponent, {
      data: {
        intention: intention,
        onSave: (intention: Intention) => {
          if (intention.id) {
            this.intentionService
              .update(intention)
              .pipe(take(1))
              .subscribe(this.reloadPage.bind(this));

            return;
          }

          this.intentionService
            .save(intention)
            .pipe(take(1))
            .subscribe((response) => {
              this.intentions.update((prev) => [...prev, response]);
            });
        },
      },
    });
  }

  public openServiceTypeFormModal(serviceType?: ServiceType): void {
    this.dialogService.open(ServiceTypeFormComponent, {
      data: {
        serviceType: serviceType,
        onSave: (serviceType: ServiceType) => {
          if (serviceType.id) {
            this.serviceTypeService
              .update(serviceType)
              .pipe(take(1))
              .subscribe(this.reloadPage.bind(this));

            return;
          }

          this.serviceTypeService
            .save(serviceType)
            .pipe(take(1))
            .subscribe((response) => {
              this.services.update((prev) => [...prev, response]);
            });
        },
      },
    });
  }

  public deleteServiceType(serviceType: ServiceType): void {
    if (!serviceType.id) {
      return;
    }

    this.serviceTypeService
      .delete(serviceType.id)
      .pipe(take(1))
      .subscribe(this.reloadPage.bind(this));
  }

  public deleteIntention(intention: Intention): void {
    if (!intention.id) {
      return;
    }

    this.intentionService
      .delete(intention.id)
      .pipe(take(1))
      .subscribe(this.reloadPage.bind(this));
  }

  public openIntentionDeletionConfirmation(
    event: Event,
    intention: Intention
  ): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja excluir esta intenção?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass:
        'bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-0 focus:shadow-none ',
      rejectButtonStyleClass:
        'mx-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-0 focus:shadow-none',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteIntention(intention),
    });
  }

  public openConfirmServiceDeletion(event: Event, service: ServiceType): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja excluir este serviço?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass:
        'bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-0 focus:shadow-none ',
      rejectButtonStyleClass:
        'mx-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-0 focus:shadow-none',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteServiceType(service),
    });
  }

  public ngOnInit(): void {
    this.fetchIntentions();
    this.fetchServiceTypes();
  }
}
