import { Component, OnInit } from '@angular/core';
import { ServiceType } from '../../../models/service-type.model';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-service-type-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './service-type-form.component.html',
})
export class ServiceTypeFormComponent implements OnInit {
  public form!: FormGroup;
  public isEditMode = false;

  public get name(): AbstractControl | null {
    return this.form.get('name');
  }

  public get description(): AbstractControl | null {
    return this.form.get('description');
  }

  constructor(
    private readonly fb: FormBuilder,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig
  ) {}

  public close(): void {
    this.ref.close();
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: ServiceType = {
      ...this.config.data?.serviceType,
      ...this.form.value,
    };

    this.config.data?.onSave(result);
    this.ref.close(result);
  }

  public ngOnInit(): void {
    this.isEditMode = !!this.config.data?.serviceType;

    const serviceType: ServiceType = this.config.data?.serviceType ?? {
      name: '',
      description: '',
    };

    this.form = this.fb.group({
      name: [
        serviceType.name,
        [Validators.required, Validators.maxLength(100)],
      ],
      description: [
        serviceType.description,
        [Validators.required, Validators.maxLength(300)],
      ],
    });
  }
}
