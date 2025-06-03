import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";

import { LucideAngularModule, X } from "lucide-angular";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

import { VariableType } from "../../models/variables.model";
import { AddVariableModal } from "../../models/add-service.model";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-add-service-modal",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./service-modal.component.html",
})
export class AddServiceModalComponent implements OnInit {
  public form!: FormGroup;
  public data: AddVariableModal;
  public variableType = VariableType;

  public icons = {
    add: X,
  };

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.data = config.data;
  }

  private createForm(): void {
    switch (this.data.type) {
      case VariableType.CONFRONTATION:
        this.form = this.fb.group({
          id: [null],
          price: [null, [Validators.required, Validators.min(0)]],
          areaMin: [null, [Validators.required, Validators.min(0)]],
          areaMax: [null, [Validators.required, Validators.min(0)]],
          urbanConfrontation: [false],
          ruralConfrontation: [false],
        });
        break;

      case VariableType.DISPLACEMENT:
        this.form = this.fb.group({
          id: [null],
          areaMin: [null, [Validators.required, Validators.min(0)]],
          areaMax: [null, [Validators.required, Validators.min(0)]],
          multiplier: [null, [Validators.required, Validators.min(0)]],
        });
        break;

      case VariableType.ACCOMODATION:
        this.form = this.fb.group({
          id: [null],
          price: [null, [Validators.required, Validators.min(0)]],
          distanteMin: [null, [Validators.required, Validators.min(0)]],
          distanteMax: [null, [Validators.required, Validators.min(0)]],
        });
        break;

      case VariableType.STARTING_POINT:
        this.form = this.fb.group({
          id: [null],
          city: ["", Validators.required],
          state: ["", Validators.required],
          street: ["", Validators.required],
          number: ["", Validators.required],
          country: ["", Validators.required],
          neighborhood: ["", Validators.required],
        });
        break;
    }
  }

  public getFieldError(field: string): string {
    const control = this.form.get(field);
    let errorMessage = "";

    if (!control?.touched || !control?.dirty) {
      return errorMessage;
    }

    if (control?.hasError("required")) {
      errorMessage = "Campo obrigatório";
    } else if (control?.hasError("min")) {
      errorMessage = "Valor mínimo inválido";
    } else if (control?.hasError("maxlength")) {
      errorMessage = "Valor máximo inválido";
    }

    return errorMessage;
  }

  public onSubmit(): void {
    console.log(this.form.value);

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.data.onSave(this.data.type, this.form.value);
    this.ref.close();
  }

  public isFormValid(): boolean {
    if (this.data.type === VariableType.CONFRONTATION) {
      const urbanOrRuralIsSelected =
        this.form.get("urbanConfrontation")?.value === true ||
        this.form.get("ruralConfrontation")?.value === true;

      return this.form.valid && urbanOrRuralIsSelected;
    }

    return this.form.valid;
  }

  public onClose(): void {
    this.ref.close();
  }

  public ngOnInit(): void {
    this.createForm();

    if (this.data.initialData) {
      this.form.patchValue(this.data.initialData);
    }
  }
}
