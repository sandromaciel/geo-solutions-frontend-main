import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Intention } from '../../../models/intention.model';
import { ServiceTypeService } from '../../../services/service-type.service';
import { catchError, finalize, take } from 'rxjs';
import { ServiceType } from '../../../models/service-type.model';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-intention-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DropdownModule],
  templateUrl: './intention-form.component.html',
})
export class IntentionFormComponent implements OnInit {
  public form!: FormGroup;
  public isLoading = true;
  public isEditMode = false;
  public serviceTypes: ServiceType[] = [];

  public get name(): AbstractControl | null {
    return this.form.get('name');
  }

  public get description(): AbstractControl | null {
    return this.form.get('description');
  }

  public get serviceTypeId(): AbstractControl | null {
    return this.form.get('serviceTypeId');
  }

  public get serviceTypeName(): AbstractControl | null {
    return this.form.get('serviceTypeName');
  }

  public get limit_Area(): AbstractControl | null {
    return this.form.get('limit_Area');
  }

  public get daily_Price(): AbstractControl | null {
    return this.form.get('daily_Price');
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly fb: FormBuilder,
    private readonly serviceTypeService: ServiceTypeService
  ) {}

  private loadServiceTypes(): void {
    this.serviceTypeService
      .findAll()
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError((error) => {
          console.error('Erro ao carregar tipos de serviço', error);
          return [];
        })
      )
      .subscribe((response) => {
        this.serviceTypes = response;
      });
  }

  public submit(): void {
    if (!this.form.value.serviceTypeId) {
      this.form.get('serviceTypeId')?.setErrors({ required: true });
    }

    const serviceTypeName = this.serviceTypes.find(
      (serviceType) => serviceType.id === this.form.value.serviceTypeId
    )?.name;

    this.form.patchValue({ serviceTypeName });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: Intention = {
      ...this.config.data?.intention,
      ...this.form.value,
    };

    this.config.data?.onSave(result);
    this.ref.close(result);
  }

  public close(): void {
    this.ref.close();
  }

  public ngOnInit(): void {
    this.isEditMode = !!this.config.data?.intention;

    const intention: Intention = this.config.data?.intention ?? {
      name: '',
      limit_Area: 0,
      daily_Price: 0,
      description: '',
      serviceTypeId: 0,
      serviceTypeName: '',
      urbanConfrontation: false,
      ruralConfrontation: false,
    };

    this.form = this.fb.group({
      name: [intention.name, [Validators.required, Validators.maxLength(100)]],
      description: [
        intention.description,
        [Validators.required, Validators.maxLength(300)],
      ],
      serviceTypeId: [intention.serviceTypeId, Validators.required],
      serviceTypeName: [intention.serviceTypeName, Validators.required],
      limit_Area: [
        intention.limit_Area,
        [Validators.required, Validators.min(1)],
      ],
      daily_Price: [
        intention.daily_Price,
        [Validators.required, Validators.min(0)],
      ],
      urbanConfrontation: [intention.urbanConfrontation],
      ruralConfrontation: [intention.ruralConfrontation],
    });

    this.loadServiceTypes();
  }
}
