import { FormGroup } from '@angular/forms';

export const getErrorMessage = (control: string, form: FormGroup): string => {
  const formControl = form.get(control);

  if (formControl && (formControl.touched || formControl?.dirty)) {
    if (formControl?.hasError('required')) {
      return 'Campo obrigatório';
    }

    if (formControl?.hasError('email')) {
      return 'Email inválido';
    }

    if (formControl?.hasError('minlength')) {
      if (control === 'password') {
        return 'A senha deve ter no mínimo 8 caracteres';
      }
      if (control === 'name') {
        return 'O nome deve ter no mínimo 2 caracteres';
      }
      return `Mínimo de ${formControl?.errors?.['minlength'].requiredLength} caracteres`;
    }

    if (formControl?.hasError('pattern')) {
      if (control === 'cell') {
        return 'Número de celular inválido. Exemplo: (31) 98888-8888';
      }
      return 'Formato inválido';
    }
  }

  return '';
};