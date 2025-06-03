import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, EMPTY, finalize, Subject, take, takeUntil } from 'rxjs';
import { getErrorMessage } from '../../../../shared/utils/form.utils';
import { ToastService } from '../../../../core/services/toast.service';
import { Register, UserType } from '../../../../core/models/register.model';
import { RegisterService } from '../../../../core/services/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup-form.component.html',
})
export class SignupFormComponent implements OnDestroy {
  public form: FormGroup;
  public loading = false;
  public getErrorMessage = getErrorMessage;

  private readonly onDestroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService,
    private readonly registerService: RegisterService,
    private readonly router: Router 
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      cell: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.listenToCellFieldChanges();
  }

  private listenToCellFieldChanges(): void {
    const field = this.form.get('cell');

    field?.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((value) => {
      if (!value) {
        return;
      }

      field?.setValue(this.formatPhone(value), { emitEvent: false });
    });
  }

  private formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').substring(0, 11);

    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 6) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    } else if (digits.length <= 10) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    } else {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      console.log('Formulário inválido');
      this.form.markAllAsTouched();
      this.toastService.showError('Por favor, corrija os erros no formulário.');
      return;
    }
  
    const { name, email, cell, password } = this.form.value;
  
    const registerPayload: Register = {
      name,
      cell,
      email,
      password,
      userType: UserType.USER,
    };
  
      this.loading = true;
      this.registerService
        .register(registerPayload)
        .pipe(
          take(1),
          finalize(() => {
            this.loading = false;
          }),
          catchError((error) => {
            console.error('Erro na requisição:', error);
            const msg = error?.error?.message || 'Erro ao registrar.';
            this.toastService.showError(msg);
            return EMPTY;
          })
        )
        .subscribe((response) => {
          this.toastService.showSuccess('Cadastro realizado com sucesso!');
          this.form.reset();
          this.router.navigate(['/auth/signin']);
        });
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}