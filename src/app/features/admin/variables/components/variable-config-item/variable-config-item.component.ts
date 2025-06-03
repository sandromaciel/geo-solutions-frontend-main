import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';

import { ConfirmationService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';

import { VariableConfig, VariableType } from '../../models/variables.model';

@Component({
  selector: 'app-variable-config-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmPopupModule],
  providers: [ConfirmationService],
  templateUrl: './variable-config-item.component.html',
})
export class VariableConfigItemComponent {
  public readonly type = model.required<VariableType>();
  public readonly config = model.required<VariableConfig>();

  public readonly onEdit = model.required<Function>();
  public readonly onDelete = model.required<Function>();

  public readonly icons = {
    pencil: Pencil,
    trash: Trash2,
  };

  public get isConfrontacao() {
    return this.type() === VariableType.CONFRONTATION;
  }

  public get isDeslocamento() {
    return this.type() === VariableType.DISPLACEMENT;
  }

  public get isHospedagem() {
    return this.type() === VariableType.ACCOMODATION;
  }

  public get isPontoPartida() {
    return this.type() === VariableType.STARTING_POINT;
  }

  constructor(private confirmationService: ConfirmationService) {}

  public confirmDelete(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja excluir esta configuração?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass:
        'bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-0 focus:shadow-none ',
      rejectButtonStyleClass:
        'mx-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-0 focus:shadow-none',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.onDelete()(this.type(), this.config().id);
      },
    });
  }
}
