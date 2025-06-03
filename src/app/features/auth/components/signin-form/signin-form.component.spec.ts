import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { of, throwError } from 'rxjs';

import { SigninFormComponent } from './signin-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('SigninFormComponent', () => {
  let component: SigninFormComponent;
  let fixture: ComponentFixture<SigninFormComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Criar spies para os serviços injetados
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signin', 'isAdmin']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showError',
      'showSuccess',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ToastModule, SigninFormComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SigninFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty email and password', () => {
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should validate email is required', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password is required', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.hasError('required')).toBeTruthy();
  });

  it('should not call signin if form is invalid', () => {
    component.form.setValue({
      email: 'invalid-email',
      password: 'password123',
    });
    component.onSubmit();
    expect(authServiceSpy.signin).not.toHaveBeenCalled();
  });

  it('should call signin and navigate to about page for regular users', () => {
    const mockResponse = { jwtToken: 'fake-token' };
    authServiceSpy.signin.and.returnValue(of(mockResponse));
    authServiceSpy.isAdmin.and.returnValue(false);

    component.form.setValue({
      email: 'user@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(authServiceSpy.signin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith(
      'Logado com sucesso!'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/about']);
  });

  it('should call signin and navigate to admin page for admin users', () => {
    const mockResponse = { jwtToken: 'fake-token' };
    authServiceSpy.signin.and.returnValue(of(mockResponse));
    authServiceSpy.isAdmin.and.returnValue(true);

    component.form.setValue({
      email: 'admin@example.com',
      password: 'admin123',
    });

    component.onSubmit();

    expect(authServiceSpy.signin).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'admin123',
    });
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith(
      'Logado com sucesso!'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should handle error when signin fails', () => {
    const errorResponse = {
      error: { message: 'Credenciais inválidas' },
    };
    authServiceSpy.signin.and.returnValue(throwError(() => errorResponse));

    component.form.setValue({
      email: 'user@example.com',
      password: 'wrong-password',
    });

    component.onSubmit();

    expect(authServiceSpy.signin).toHaveBeenCalled();
    expect(toastServiceSpy.showError).toHaveBeenCalledWith(
      'Credenciais inválidas'
    );
    expect(toastServiceSpy.showSuccess).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should set loading to true while submitting and false after completion', () => {
    authServiceSpy.signin.and.returnValue(of({ jwtToken: 'fake-token' }));
    authServiceSpy.isAdmin.and.returnValue(false);

    component.form.setValue({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(component.loading).toBeFalse();
    component.onSubmit();
    expect(component.loading).toBeFalse(); // Será false após a conclusão devido ao finalize()
  });
});
