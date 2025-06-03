import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceTypeFormComponent } from './service-type-form.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServiceType } from '../../../models/service-type.model';

describe('ServiceTypeFormComponent', () => {
  let component: ServiceTypeFormComponent;
  let fixture: ComponentFixture<ServiceTypeFormComponent>;
  let dialogRefSpy: jasmine.SpyObj<DynamicDialogRef>;
  let configMock: DynamicDialogConfig;
  let onSaveSpy: jasmine.Spy;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('DynamicDialogRef', ['close']);
    onSaveSpy = jasmine.createSpy('onSave');

    configMock = {
      data: {
        serviceType: undefined,
        onSave: onSaveSpy,
      },
    } as DynamicDialogConfig;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ServiceTypeFormComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRefSpy },
        { provide: DynamicDialogConfig, useValue: configMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values in create mode', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.form.value).toEqual({
      name: '',
      description: '',
    });
  });

  it('should initialize the form with serviceType values in edit mode', () => {
    const serviceType: ServiceType = {
      id: '1',
      name: 'Test Service',
      description: 'Test Description',
    };

    configMock.data = {
      serviceType,
      onSave: onSaveSpy,
    };

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(component.form.value).toEqual({
      name: serviceType.name,
      description: serviceType.description,
    });
  });

  it('should validate required fields', () => {
    component.form.setValue({
      name: '',
      description: '',
    });

    expect(component.form.valid).toBeFalse();
    expect(component.name?.errors?.['required']).toBeTruthy();
    expect(component.description?.errors?.['required']).toBeTruthy();
  });

  it('should validate max length', () => {
    const longString = 'a'.repeat(101);
    const longDescription = 'a'.repeat(301);

    component.form.setValue({
      name: longString,
      description: longDescription,
    });

    expect(component.form.valid).toBeFalse();
    expect(component.name?.errors?.['maxlength']).toBeTruthy();
    expect(component.description?.errors?.['maxlength']).toBeTruthy();
  });

  it('should close dialog when close method is called', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should mark form as touched when submitting invalid form', () => {
    spyOn(component.form, 'markAllAsTouched');
    component.form.setValue({
      name: '',
      description: '',
    });

    component.submit();

    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(onSaveSpy).not.toHaveBeenCalled();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should save data and close dialog when submitting valid form', () => {
    const formValue = {
      name: 'New Service',
      description: 'New Description',
    };

    component.form.setValue(formValue);
    component.submit();

    expect(onSaveSpy).toHaveBeenCalledWith(formValue);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(formValue);
  });

  it('should merge existing serviceType data with form values when saving in edit mode', () => {
    const serviceType: ServiceType = {
      id: '1',
      name: 'Original Name',
      description: 'Original Description',
    };

    configMock.data = {
      serviceType,
      onSave: onSaveSpy,
    };

    component.ngOnInit();

    const updatedValues = {
      name: 'Updated Name',
      description: 'Updated Description',
    };

    component.form.setValue(updatedValues);
    component.submit();

    const expectedResult = {
      ...serviceType,
      ...updatedValues,
    };

    expect(onSaveSpy).toHaveBeenCalledWith(expectedResult);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(expectedResult);
  });
});
