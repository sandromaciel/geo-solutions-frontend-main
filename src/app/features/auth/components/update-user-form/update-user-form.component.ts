import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, finalize, switchMap, take } from 'rxjs';
import { UserDTO } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { BudgetService } from '../../../../core/services/budget.service';
import { BudgetResponse } from '../../../../core/models/budget/budget.model';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { BudgetPdfService } from '../../../../core/services/budget-pdf.service';

@Component({
  selector: 'app-update-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ConfirmPopupModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './update-user-form.component.html',
})
export class UpdateUserFormComponent implements OnInit {
  form!: FormGroup;
  userId!: string;
  loading = false;
  errorMsg = '';
  public userBudgets: BudgetResponse[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly budgetService: BudgetService,
    private readonly budgetPdfService: BudgetPdfService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  private fetchUserData(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          password: '',
        });
      },
      error: (err) => {
        this.errorMsg = 'Erro ao carregar dados do usuário.';
        this.showToast('error', 'Erro', this.errorMsg);
        console.error(err);
      },
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]], 
    });
  }

  private getUserBudgets(): void {
    this.loading = true;
    this.budgetService
      .getBudgetsByUserId(this.userId)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        }),
        catchError((err) => {
          this.errorMsg = 'Erro ao carregar orçamentos.';
          this.showToast('error', 'Erro', this.errorMsg);
          console.error(err);
          return [[]];
        })
      )
      .subscribe((budgets) => {
        this.userBudgets = budgets;
      });
  }

  private handleDeleteUser(): void {
    this.loading = true;
    this.userService
      .deleteUser(this.userId)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        }),
        catchError((err) => {
          this.errorMsg = 'Erro ao deletar usuário.';
          this.showToast('error', 'Erro', this.errorMsg);
          console.error(err);
          return [];
        })
      )
      .subscribe(() => {
        this.showToast('success', 'Sucesso', 'Conta encerrada com sucesso.');
        this.router.navigate(['/auth']);
      });
  }

  public onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { name, email, password } = this.form.value;

    const payload: Partial<UserDTO> & { password?: string } = {
      id: this.userId,
      name,
      email,
      userType: 2,
    };
    if (password) {
      payload.password = password;
    }

    this.userService
      .updateUser(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        }),
        catchError((err) => {
          this.errorMsg = 'Erro ao atualizar dados do usuário.';
          this.showToast('error', 'Erro', this.errorMsg);
          console.error(err);
          return [];
        })
      )
      .subscribe(() => {
        this.showToast('success', 'Sucesso', 'Dados atualizados com sucesso.');
        this.router.navigate(['/auth']);
      });
  }

  public openDeleteUserConfirmation(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja deletar seu usuário?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass:
        'bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-0 focus:shadow-none',
      rejectButtonStyleClass:
        'mx-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-0 focus:shadow-none',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => this.handleDeleteUser(),
    });
  }

  public viewBudgetPdf(budget: BudgetResponse): void {
    try {
      this.budgetPdfService.generatePdf(budget);
    } catch (error) {
      this.showToast('error', 'Erro', 'Falha ao gerar o PDF. Tente novamente.');
      console.error(error);
    }
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail,
    });
  }

  public ngOnInit(): void {
    this.initializeForm();
    const currentUser = this.authService.getDecodedJwt();

    if (!currentUser) {
      this.showToast('error', 'Erro', 'Usuário não autenticado.');
      this.router.navigate(['/auth']);
      return;
    }

    this.userId = currentUser.nameid;
    this.fetchUserData(this.userId);
    this.getUserBudgets();
  }
}