import { Component, model } from '@angular/core';

import { LucideAngularModule, Plus } from 'lucide-angular';
import { DialogService } from 'primeng/dynamicdialog';

import { VariableConfig, VariableType } from '../../models/variables.model';
import { VariableCard } from '../../models/variables-card.model';
import { AddServiceModalComponent } from '../service-modal/service-modal.component';
import { VariableConfigItemComponent } from '../variable-config-item/variable-config-item.component';

@Component({
  selector: 'app-variable-card',
  standalone: true,
  imports: [LucideAngularModule, VariableConfigItemComponent],
  providers: [DialogService],
  templateUrl: './variable-card.component.html',
})
export class VariableCardComponent {
  public readonly type = model.required<VariableType>();
  public readonly title = model.required<VariableCard['title']>();
  public readonly configs = model.required<VariableCard['configs']>();
  public readonly onAdd = model.required<VariableCard['onAddConfig']>();
  public readonly onEdit = model.required<VariableCard['onEditConfig']>();
  public readonly onDelete = model.required<VariableCard['onDeleteConfig']>();

  public readonly icons = {
    plus: Plus,
  };

  constructor(private readonly dialogService: DialogService) {}

  public openAddConfigModal(): void {
    this.dialogService.open(AddServiceModalComponent, {
      header: 'Adicionar Configuração',
      styleClass:
        'w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all',
      data: {
        initialData: null,
        type: this.type(),
        onSave: this.onAdd(),
      },
    });
  }

  public openEditConfigModal(config: VariableConfig): void {
    this.dialogService.open(AddServiceModalComponent, {
      header: 'Editar Configuração',
      styleClass:
        'w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all',
      data: {
        initialData: config,
        type: this.type(),
        onSave: this.onEdit(),
      },
    });
  }
}
