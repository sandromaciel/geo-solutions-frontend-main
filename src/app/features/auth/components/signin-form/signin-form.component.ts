import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { catchError, EMPTY, finalize, take } from 'rxjs';

import { getErrorMessage } from '../../../../shared/utils/form.utils';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule],
  templateUrl: './signin-form.component.html',
})
export class SigninFormComponent {
  public form: FormGroup;
  public loading = false;
  public getErrorMessage = getErrorMessage;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastService: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public onSubmit(): void {
    const formData = this.form.value;

    if (!this.form.valid) {
      return;
    }

    this.loading = true;
    this.authService
      .signin(formData)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        }),
        catchError((errorResponse) => {
          const errorMessage = errorResponse.error.message;
          this.toastService.showError(errorMessage);

          return EMPTY;
        })
      )
      .subscribe((response) => {
        if (response.jwtToken) {
          this.toastService.showSuccess('Logado com sucesso!');

          this.authService.isAdmin()
            ? this.router.navigate(['/admin'])
            : this.router.navigate(['/about']);
        }
      });
  }
}
