import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IntentionFormComponent } from './intention-form.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Intention } from '../../../models/intention.model';
import { ServiceTypeService } from '../../../services/service-type.service';
import { ServiceType } from '../../../models/service-type.model';
import { of, throwError } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IntentionFormComponent', () => {
  let component: IntentionFormComponent;
  let fixture: ComponentFixture<IntentionFormComponent>;
  let dialogRefSpy: jasmine.SpyObj<DynamicDialogRef>;
  let configMock: DynamicDialogConfig;
  let serviceTypeSpy: jasmine.SpyObj<ServiceTypeService>;
  let onSaveSpy: jasmine.Spy;

  const mockServiceTypes: ServiceType[] = [
    { id: '1', name: 'Service Type 1', description: 'Description 1' },
    { id: '2', name: 'Service Type 2', description: 'Description 2' },
  ];

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('DynamicDialogRef', ['close']);
    serviceTypeSpy = jasmine.createSpyObj('ServiceTypeService', ['findAll']);
    onSaveSpy = jasmine.createSpy('onSave');

    configMock = {
      data: {
        intention: undefined,
        onSave: onSaveSpy,
      },
    } as DynamicDialogConfig;

    serviceTypeSpy.findAll.and.returnValue(of(mockServiceTypes));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        DropdownModule,
        IntentionFormComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRefSpy },
        { provide: DynamicDialogConfig, useValue: configMock },
        { provide: ServiceTypeService, useValue: serviceTypeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IntentionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load service types on init', () => {
    expect(serviceTypeSpy.findAll).toHaveBeenCalled();
    expect(component.serviceTypes).toEqual(mockServiceTypes);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle service type loading error', async () => {
    // Resetamos o TestBed para criar um novo componente com valores diferentes
    TestBed.resetTestingModule();

    // Criamos um novo spy para o serviço
    const errorServiceTypeSpy = jasmine.createSpyObj('ServiceTypeService', [
      'findAll',
    ]);
    errorServiceTypeSpy.findAll.and.returnValue(
      throwError(() => new Error('Error loading service types'))
    );

    // Configuramos o novo TestBed
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        DropdownModule,
        IntentionFormComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRefSpy },
        { provide: DynamicDialogConfig, useValue: configMock },
        { provide: ServiceTypeService, useValue: errorServiceTypeSpy },
      ],
    }).compileComponents();

    const errorFixture = TestBed.createComponent(IntentionFormComponent);
    const errorComponent = errorFixture.componentInstance;

    spyOn(console, 'error');

    errorFixture.detectChanges(); // ngOnInit é chamado aqui

    expect(console.error).toHaveBeenCalled();
    expect(errorComponent.serviceTypes).toEqual([]);
    expect(errorComponent.isLoading).toBeFalse();
  });

  it('should initialize form with default values in create mode', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.form.value).toEqual({
      name: '',
      description: '',
      serviceTypeId: 0,
      serviceTypeName: '',
      limit_Area: 0,
      daily_Price: 0,
      urbanConfrontation: false,
      ruralConfrontation: false,
    });
  });

  it('should initialize form with intention values in edit mode', () => {
    const intention: Intention = {
      id: '1',
      name: 'Test Intention',
      description: 'Test Description',
      serviceTypeId: 1,
      serviceTypeName: 'Service Type 1',
      limit_Area: 100,
      daily_Price: 50,
      urbanConfrontation: true,
      ruralConfrontation: false,
    };

    configMock.data = {
      intention,
      onSave: onSaveSpy,
    };

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(component.form.value).toEqual({
      name: intention.name,
      description: intention.description,
      serviceTypeId: intention.serviceTypeId,
      serviceTypeName: intention.serviceTypeName,
      limit_Area: intention.limit_Area,
      daily_Price: intention.daily_Price,
      urbanConfrontation: intention.urbanConfrontation,
      ruralConfrontation: intention.ruralConfrontation,
    });
  });

  it('should validate required fields', () => {
    component.form.setValue({
      name: '',
      description: '',
      serviceTypeId: null as unknown as number,
      serviceTypeName: '',
      limit_Area: null as unknown as number,
      daily_Price: null as unknown as number,
      urbanConfrontation: false,
      ruralConfrontation: false,
    });

    expect(component.form.valid).toBeFalse();
    expect(component.name?.errors?.['required']).toBeTruthy();
    expect(component.description?.errors?.['required']).toBeTruthy();
    expect(component.serviceTypeId?.errors?.['required']).toBeTruthy();
    expect(component.limit_Area?.errors?.['required']).toBeTruthy();
    expect(component.daily_Price?.errors?.['required']).toBeTruthy();
  });

  it('should validate number fields', () => {
    component.form.patchValue({
      limit_Area: 0,
      daily_Price: -1,
    });

    expect(component.form.valid).toBeFalse();
    expect(component.limit_Area?.errors?.['min']).toBeTruthy();
    expect(component.daily_Price?.errors?.['min']).toBeTruthy();
  });

  it('should close dialog when close method is called', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should mark form as touched when submitting invalid form', () => {
    spyOn(component.form, 'markAllAsTouched');
    component.form.patchValue({
      name: '',
      serviceTypeId: null,
    });

    component.submit();

    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(onSaveSpy).not.toHaveBeenCalled();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should set serviceTypeName when submitting form', () => {
    component.form.patchValue({
      name: 'Valid Name',
      description: 'Valid Description',
      serviceTypeId: '1',
      limit_Area: 100,
      daily_Price: 50,
    });

    component.submit();

    expect(component.form.value.serviceTypeName).toBe('Service Type 1');
  });

  it('should save data and close dialog when submitting valid form', () => {
    const formValue = {
      name: 'New Intention',
      description: 'New Description',
      serviceTypeId: '1',
      serviceTypeName: 'Service Type 1',
      limit_Area: 100,
      daily_Price: 50,
      urbanConfrontation: true,
      ruralConfrontation: false,
    };

    component.form.patchValue(formValue);
    component.submit();

    expect(onSaveSpy).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should merge existing intention data with form values when saving in edit mode', () => {
    const intention: Intention = {
      id: '1',
      name: 'Original Name',
      description: 'Original Description',
      serviceTypeId: 1,
      serviceTypeName: 'Service Type 1',
      limit_Area: 100,
      daily_Price: 50,
      urbanConfrontation: true,
      ruralConfrontation: false,
    };

    configMock.data = {
      intention,
      onSave: onSaveSpy,
    };

    component.ngOnInit();

    const updatedValues = {
      name: 'Updated Name',
      description: 'Updated Description',
      serviceTypeId: '2',
      serviceTypeName: 'Service Type 2',
      limit_Area: 200,
      daily_Price: 75,
      urbanConfrontation: false,
      ruralConfrontation: true,
    };

    component.form.patchValue(updatedValues);
    component.submit();

    expect(onSaveSpy).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
