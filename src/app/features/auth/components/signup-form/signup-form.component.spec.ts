import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SignupFormComponent } from './signup-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { RegisterService } from '../../../../core/services/register.service';
import { Register, UserType } from '../../../../core/models/register.model';

describe('SignupFormComponent', () => {
  let component: SignupFormComponent;
  let fixture: ComponentFixture<SignupFormComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let registerServiceSpy: jasmine.SpyObj<RegisterService>;
  let router: Router;

  beforeEach(async () => {
    const toastSpy = jasmine.createSpyObj('ToastService', [
      'showError',
      'showSuccess',
    ]);
    const registerSpy = jasmine.createSpyObj('RegisterService', ['register']);

    await TestBed.configureTestingModule({
      imports: [SignupFormComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: ToastService, useValue: toastSpy },
        { provide: RegisterService, useValue: registerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupFormComponent);
    component = fixture.componentInstance;
    toastServiceSpy = TestBed.inject(
      ToastService
    ) as jasmine.SpyObj<ToastService>;
    registerServiceSpy = TestBed.inject(
      RegisterService
    ) as jasmine.SpyObj<RegisterService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('cell')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when empty', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should validate name field', () => {
      const nameControl = component.form.get('name');

      // Empty name - invalid
      nameControl?.setValue('');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('required')).toBeTruthy();

      // Name too short - invalid
      nameControl?.setValue('A');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('minlength')).toBeTruthy();

      // Valid name
      nameControl?.setValue('John Doe');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should validate email field', () => {
      const emailControl = component.form.get('email');

      // Empty email - invalid
      emailControl?.setValue('');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('required')).toBeTruthy();

      // Invalid email format
      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('email')).toBeTruthy();

      // Valid email
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should validate cell field', () => {
      const cellControl = component.form.get('cell');

      // Empty cell - invalid
      cellControl?.setValue('');
      expect(cellControl?.valid).toBeFalsy();
      expect(cellControl?.hasError('required')).toBeTruthy();

      // Invalid cell format
      cellControl?.setValue('123456');
      expect(cellControl?.valid).toBeFalsy();
      expect(cellControl?.hasError('pattern')).toBeTruthy();

      // Valid cell formats
      cellControl?.setValue('(11) 98765-4321');
      expect(cellControl?.valid).toBeTruthy();

      cellControl?.setValue('11987654321');
      fixture.detectChanges();
      expect(cellControl?.value).toBe('(11) 98765-4321');
      expect(cellControl?.valid).toBeTruthy();
    });

    it('should validate password field', () => {
      const passwordControl = component.form.get('password');

      // Empty password - invalid
      passwordControl?.setValue('');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();

      // Password too short - invalid
      passwordControl?.setValue('1234');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('minlength')).toBeTruthy();

      // Valid password
      passwordControl?.setValue('12345678');
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should mark form as valid when all fields are valid', () => {
      component.form.setValue({
        name: 'John Doe',
        email: 'test@example.com',
        cell: '(11) 98765-4321',
        password: '12345678',
      });

      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('Phone Formatting', () => {
    it('should format cell number correctly for different lengths', () => {
      const cellControl = component.form.get('cell');

      // Test with 2 digits
      cellControl?.setValue('11');
      fixture.detectChanges();
      expect(cellControl?.value).toBe('(11');

      // Test with 4 digits
      cellControl?.setValue('1198');
      fixture.detectChanges();
      expect(cellControl?.value).toBe('(11) 98');

      // Test with 8 digits
      cellControl?.setValue('11987654');
      fixture.detectChanges();
      expect(cellControl?.value).toBe('(11) 9876-54');

      // Test with full 11 digits
      cellControl?.setValue('11987654321');
      fixture.detectChanges();
      expect(cellControl?.value).toBe('(11) 98765-4321');

      // Test with more than 11 digits (should truncate)
      cellControl?.setValue('1198765432123');
      fixture.detectChanges();
      expect(cellControl?.value).toBe('(11) 98765-4321');
    });
  });

  describe('Form Submission', () => {
    it('should show error toast and mark fields as touched when submitting invalid form', () => {
      // Form is initially empty and invalid
      component.onSubmit();

      expect(toastServiceSpy.showError).toHaveBeenCalledWith(
        'Por favor, corrija os erros no formulário.'
      );
      expect(component.form.get('name')?.touched).toBeTruthy();
      expect(component.form.get('email')?.touched).toBeTruthy();
      expect(component.form.get('cell')?.touched).toBeTruthy();
      expect(component.form.get('password')?.touched).toBeTruthy();
    });

    it('should call register service when form is valid', fakeAsync(() => {
      const validForm = {
        name: 'John Doe',
        email: 'test@example.com',
        cell: '(11) 98765-4321',
        password: 'password123',
      };

      component.form.setValue(validForm);
      registerServiceSpy.register.and.returnValue(
        of({
          id: 1,
          name: 'John Doe',
          email: 'test@example.com',
          cell: '(11) 98765-4321',
          userType: UserType.USER,
        })
      );

      const navigateSpy = spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      const expectedPayload: Register = {
        name: validForm.name,
        email: validForm.email,
        cell: validForm.cell,
        password: validForm.password,
        userType: UserType.USER,
      };

      expect(registerServiceSpy.register).toHaveBeenCalledWith(expectedPayload);
      expect(component.loading).toBeFalse();
      expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith(
        'Cadastro realizado com sucesso!'
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/signin']);
    }));

    it('should handle registration error', fakeAsync(() => {
      component.form.setValue({
        name: 'John Doe',
        email: 'test@example.com',
        cell: '(11) 98765-4321',
        password: 'password123',
      });

      const errorResponse = {
        error: { message: 'E-mail já cadastrado' },
      };
      registerServiceSpy.register.and.returnValue(
        throwError(() => errorResponse)
      );

      component.onSubmit();
      tick();

      expect(component.loading).toBeFalse();
      expect(toastServiceSpy.showError).toHaveBeenCalledWith(
        'E-mail já cadastrado'
      );
    }));

    it('should handle registration error with generic message when no specific message', fakeAsync(() => {
      component.form.setValue({
        name: 'John Doe',
        email: 'test@example.com',
        cell: '(11) 98765-4321',
        password: 'password123',
      });

      registerServiceSpy.register.and.returnValue(throwError(() => ({})));

      component.onSubmit();
      tick();

      expect(component.loading).toBeFalse();
      expect(toastServiceSpy.showError).toHaveBeenCalledWith(
        'Erro ao registrar.'
      );
    }));
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe on ngOnDestroy', () => {
      const onDestroySpy = spyOn(component['onDestroy$'], 'next');
      const completeSpy = spyOn(component['onDestroy$'], 'complete');

      component.ngOnDestroy();

      expect(onDestroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
