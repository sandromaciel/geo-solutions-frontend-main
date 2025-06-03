import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { LucideAngularModule, FileText } from 'lucide-angular';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BudgetService } from '../../../core/services/budget.service';
import { BudgetPdfService } from '../../../core/services/budget-pdf.service';
import { BudgetResponse } from '../../../core/models/budget/budget.model';

@Component({
  selector: 'app-budget-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ProgressSpinnerModule, ToastModule],
  providers: [MessageService],
  templateUrl: './budget-reports.component.html',
})
export class BudgetReportsComponent {
  public budgets = signal<BudgetResponse[]>([]);
  public isDataLoaded = signal(false);
  public readonly icons = { fileText: FileText };

  constructor(
    private readonly budgetService: BudgetService,
    private readonly budgetPdfService: BudgetPdfService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.budgetService.getAllBudgets().subscribe((budgets: BudgetResponse[]) => {
      // Ordenar por startDate (mais recente primeiro)
      const sortedBudgets = budgets.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      this.budgets.set(sortedBudgets);
      this.isDataLoaded.set(true);
    });
  }

  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  public formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  public formatAddress(address: BudgetResponse['address']): string {
    if (!address) return 'Sem endereço';
    const { street, city, state } = address;
    return `${street || ''}, ${city || ''} - ${state || ''}`.trim();
  }

  public viewBudgetPdf(budget: BudgetResponse): void {
    try {
      this.budgetPdfService.generatePdf(budget);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'PDF gerado com sucesso.',
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao gerar o PDF. Tente novamente.',
      });
      console.error('Erro ao gerar PDF:', error);
    }
  }
}