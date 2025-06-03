import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private readonly messageService: MessageService) {}

  public showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: message,
      life: 3000,
    });
  }

  public showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message,
      life: 3000,
    });
  }

  public showLoading(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Carregando',
      detail: message,
      life: 3000,
    });
  }
}
