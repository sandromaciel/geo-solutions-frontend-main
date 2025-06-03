import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './configurations.component.html',
})
export class ConfigurationsComponent implements OnInit {
  public profileForm: FormGroup;
  public passwordForm: FormGroup;
  public showPasswordForm: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.profileForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      cell: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/),
      ]),
    });

    this.passwordForm = new FormGroup(
      {
        currentPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private passwordsMatchValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const form = control as FormGroup;
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadUserData(): void {
    const decodedJwt = this.authService.getDecodedJwt();
    console.debug('Decoded JWT:', decodedJwt);
    if (decodedJwt && decodedJwt.nameid) {
      const userId = decodedJwt.nameid;
      console.debug('Loading user data for ID:', userId);
      this.userService.getUserById(userId).subscribe({
        next: (user: UserDTO) => {
          console.debug('User data loaded:', user);
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
            cell: user.cell,
          });
        },
        error: (err) => {
          this.toastService.showError('Erro ao carregar os dados do usuário.');
          console.error('Error loading user data:', err);
          if (err.status === 401) {
            this.authService.logout();
            this.router.navigate(['/auth/signin']);
          }
        },
      });
    } else {
      this.toastService.showError('Usuário não autenticado.');
      this.authService.logout();
      this.router.navigate(['/auth/signin']);
    }
  }

  public getFieldError(
    field: string,
    form: FormGroup = this.profileForm
  ): string {
    const control = form.get(field);
    let errorMessage = '';

    if (!control?.touched || !control?.dirty) {
      return errorMessage;
    }

    if (control?.hasError('required')) {
      errorMessage = 'Campo obrigatório';
    } else if (control?.hasError('email')) {
      errorMessage = 'Deve possuir um e-mail válido';
    } else if (control?.hasError('minlength')) {
      errorMessage = `Deve ter no mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    } else if (control?.hasError('pattern')) {
      if (field === 'cell') {
        errorMessage = 'Número de celular inválido. Ex: (31) 98888-8888';
      } else if (field === 'newPassword') {
        errorMessage =
          'A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial.';
      }
    }

    return errorMessage;
  }

  public togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  public submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const decodedJwt = this.authService.getDecodedJwt();
    if (decodedJwt && decodedJwt.nameid) {
      const userId = decodedJwt.nameid;

      const userData: Partial<UserDTO> = {
        id: userId,
        userType: 1,
      };

      const name = this.profileForm.get('name')?.value ?? undefined;
      const email = this.profileForm.get('email')?.value ?? undefined;
      const cell = this.profileForm.get('cell')?.value ?? undefined;

      if (name) userData.name = name;
      if (email) userData.email = email;
      if (cell) userData.cell = cell;

      this.userService.updateUser(userData).subscribe({
        next: (response) => {
          if (response && response.jwtToken) {
            this.authService.saveToken(response.jwtToken);
          }
          this.toastService.showSuccess(
            'Dados do perfil atualizados com sucesso!'
          );
          this.loadUserData();
          this.cdRef.detectChanges();
        },
        error: (err) => {
          const errorMsg = err.error || 'Erro ao atualizar o perfil.';
          this.toastService.showError(errorMsg);
          console.error('Error updating profile:', err);
          if (err.status === 401) {
            this.authService.logout();
            this.router.navigate(['/auth/signin']);
          }
        },
      });
    } else {
      this.toastService.showError('Usuário não autenticado.');
      this.authService.logout();
      this.router.navigate(['/auth/signin']);
    }
  }

  public submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    if (!currentPassword || !newPassword) {
      this.toastService.showError(
        'Por favor, preencha ambos os campos de senha.'
      );
      return;
    }

    const changePasswordData: ChangePasswordDTO = {
      currentPassword: currentPassword as string,
      newPassword: newPassword as string,
    };

    this.userService.changePassword(changePasswordData).subscribe({
      next: () => {
        this.toastService.showSuccess(
          'Senha alterada com sucesso! Faça login novamente.'
        );
        this.passwordForm.reset();
        this.showPasswordForm = false;
        this.authService.logout();
        this.router.navigate(['/auth/signin']);
      },
      error: (err) => {
        const errorMsg = err.error || 'Erro ao alterar a senha.';
        this.toastService.showError(errorMsg);
        console.error('Error changing password:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/signin']);
        }
      },
    });
  }
}

interface UserDTO {
  id?: string;
  name: string;
  email: string;
  cell: string;
  userType: number;
}

interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
