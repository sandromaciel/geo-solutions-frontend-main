import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceTypeBudget } from '../../../core/models/budget/serviceTypeBudget/service.Type.Budget.model';
import { BudgetService } from '../../../core/services/budget.service';
import { CommonModule } from '@angular/common';
import { IntentionServiceBudget } from '../../../core/models/budget/serviceTypeBudget/intention.service.budget.model';
import { EUnitOfMeasure } from '../../../core/enums/EUnitOfMeausre';
import { CalcRequest } from '../../../core/models/budget/calcParameter/calc.request.model';
import { BudgetRequest } from '../../../core/models/budget/request/budget.request.model';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

import { CalcResponse } from '../../../core/models/budget/response/CalcResponse.model';
import { FooterComponent } from '../../../core/layout/footer/footer.component';
import { ValidationError, ValidationErrorResponse } from '../../../core/models/budget/error.model';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { ViaCepService } from '../../admin/regions/services/via-cep.service';
import { UserHeaderComponent } from '../../../core/layout/user-header/user-header.component';
import { BudgetResponse } from '../../../core/models/budget/budget.model';
import { BudgetPdfService } from '../../../core/services/budget-pdf.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ToastModule,
    FooterComponent,
    UserHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss'
})
export class BudgetComponent implements OnInit {
  form: FormGroup;
  serviceTypes: ServiceTypeBudget[] = [];
  intentions: IntentionServiceBudget[] = [];
  selectedServiceTypeId: number | null = null;
  selectedIntentionServiceId: number | null = null;
  public EUnitOfMeasure = EUnitOfMeasure;
  public mostrarConfrontacoes = false;
  public redirectWpp = false;
  public readonly:boolean = false;
  public budgetData: BudgetResponse | null = null;

  ngOnInit(): void {
    this.getServiceTypes();

    const budgetId = this.route.snapshot.paramMap.get('id');
    if (budgetId) {
      this.readonly = true;
      this.getBudgetById(budgetId);
    } else {
      this.getServiceTypes();
    this.form.get('servico')?.valueChanges.subscribe((selectedServiceId: number) => {
      const selectedService = this.serviceTypes.find(s => s.id === selectedServiceId);

      this.intentions = selectedService?.intentionServices || [];

      const detalheServicoControl = this.form.get('detalheServico');

      if (this.intentions.length > 0) {
        detalheServicoControl?.enable();
        detalheServicoControl?.setValue(this.intentions[0].name);
      } else {
        detalheServicoControl?.setValue(0);
        detalheServicoControl?.disable();
      }
    });

    this.form.get('detalheServico')?.valueChanges.subscribe(nomeSelecionado => {
      const selected = this.intentions.find(i => i.name === nomeSelecionado);
      this.mostrarConfrontacoes = selected?.urbanConfrontation || selected?.ruralConfrontation || false;

      if (this.mostrarConfrontacoes) {
        this.form.get('confrontations')?.enable();
      } else {
        this.form.get('confrontations')?.reset();
        this.form.get('confrontations')?.disable();
      }
    });
  }

  /*  this.form.get('cep')?.valueChanges.subscribe((cep: string) => {
      if (cep && cep.replace(/\D/g, '').length === 8) {
        this.getAddressByCep();
      }
    });*/
  }

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private authService: AuthService,
    public messageService: MessageService,
    private viaCepService: ViaCepService,
    private router: Router,
    private budgetPdfService: BudgetPdfService
  ) {
    this.form = this.fb.group({
      cep: [''],
      bairro: [{ value: '', disabled: true }, Validators.required],
      logradouro: [{ value: '', disabled: true }],
      cidade: [{ value: '', disabled: true }],
      estado: [{ value: '', disabled: true }],
      numero: [{ value: null, disabled: true }],
      complemento: [{ value: '', disabled: true }],
      area: [0],
      servico: [0],
      detalheServico: [{ value: 0, disabled: true }],
      unitOfMeasure: [EUnitOfMeasure.SquareMeter],
      confrontations: [0],
      price:['']
    });
  }

  getServiceTypes() : void
  {
    this.budgetService.getAllServiceTypes()
    .subscribe((serviceTypes:ServiceTypeBudget[]) =>
      {
        this.serviceTypes = serviceTypes;
      })

  }

  getAddressByCep(): void {
    const cep = this.form.get('cep')?.value;
    if (!cep) {
      return;
    }

    this.viaCepService.getCityIbgeIdByCep(cep).subscribe({
      next: (ibgeId: number | null) => {
        if (!ibgeId) {
          this.showNoCoverageModal();
          return;
        }

        this.budgetService.checkCityCoverageByIbge(ibgeId.toString()).subscribe({
          next: (hasCoverage: boolean) => {
            if (!hasCoverage) {
              this.showNoCoverageModal();
              return;
            }
            this.form.get('numero')?.enable();
            this.form.get('bairro')?.enable();
            this.form.get('logradouro')?.enable();
            this.form.get('cidade')?.enable();
            this.form.get('estado')?.enable();
            this.form.get('complemento')?.enable();

            this.budgetService.fetchAddressByCep(cep).subscribe({
              next: (response) => {
                this.form.patchValue({
                  logradouro: response.street,
                  bairro: response.neighborhood,
                  cidade: response.city,
                  estado: response.state,
                });
              },
              error: (err) => {
                console.error('Erro ao buscar o endereço:', err);
                this.showToast('error', `Erro`,'Não foi possível buscar o endereço. Verifique o CEP e tente novamente.')
              },
            });
          },
          error: (err) => {
            console.error('Erro ao verificar cobertura:', err);
            this.showNoCoverageModal();
          },
        });
      },
      error: (err) => {
        console.error('Erro ao consultar ViaCEP:', err);
        this.showNoCoverageModal();
      },
    });
  }

  private showNoCoverageModal(): void {
    this.showToast('warn',
      'Área não atendida',
      'No momento, este CEP não faz parte da nossa área de atendimento.',
      true,
      'custom-toast',
      {
        whatsappRedirect: true,
      },
      true
    )


    this.form.patchValue({
      logradouro: '',
      bairro: '',
      cidade: '',
      estado: '',
      numero: null,
      complemento: '',
    });
    this.form.get('numero')?.disable();
    this.form.get('complemento')?.disable();
  }

  public onWppButtonClick(toast: any): void {
      window.open('https://wa.me/5531987824674', '_blank'); // inserir redirecionamento para o numero correto
  }

   processarCalculo(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if(!this.authService.isAuthenticated())
      {
        this.showToast('error', `Usuario não encontrado`,'Por favor, cadastre-se ou efetue o login para realizar o cálculo')
        return;
      }
    const formValue = this.form.getRawValue();

    const calcRequest: CalcRequest = {
      address: {
        street: formValue.logradouro,
        number: formValue.numero,
        neighborhood: formValue.bairro,
        city: formValue.cidade,
        state: formValue.estado,
        country: 'Brasil'
      },
      areaSettings: {
        area_Size: formValue.area,
        unitOfMeasure: formValue.unitOfMeasure
      },
      confrontations: formValue.confrontations ?? 0,
      serviceTypeId: formValue.servico,
      intentionServiceId: this.getIntentionServiceId(formValue.detalheServico)
    };

    console.log('Requisição para cálculo:', calcRequest);
    this.budgetService.processCalc(calcRequest).subscribe({
      next: (price: CalcResponse) => {
        this.form.get('price')?.setValue(price.calcParametersResponse);
      },
      error: (err) => {
        const response: ValidationErrorResponse = err.error

        const mensagensErro = response.errors
            .map(e => `${e.message}`)
            .join('<br>');

        this.showToast('error', `Erro ao gerar valor final`,mensagensErro)
      }
    });
  }
  getIntentionServiceId(name: string): number {
    const intention = this.intentions.find(i => i.name === name);
    return intention ? intention.id : 0;
  }

  gerarOrcamento(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if(!this.authService.isAuthenticated())
      {
        this.showToast('error', `Usuario não encontrado`,'Por favor, cadastre-se ou efetue o login gerar o orçamento')
        return;
      }

    const formValue = this.form.getRawValue();
    const userId = this.authService.getUserIdFromToken()
    const normalizedPrice =  parseFloat(
      formValue.price
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    )

    const today = new Date();
    const formattedStartDate = today.toISOString().split('.')[0];

    const budget: BudgetRequest = {
      userId: userId ?? 0,
      price: Number.isNaN(normalizedPrice) ? 0 : normalizedPrice,
      startDate: formattedStartDate,
      endDate: formValue.endDate,
      confrontations: formValue.confrontations || 0,
      serviceTypeId: formValue.servico || 0,
      intentionServiceId: this.getIntentionServiceId(formValue.detalheServico),
      budgetAreaSettings: {
        area_Size: formValue.area,
        unitOfMeasure: formValue.unitOfMeasure
      },
      address: {
        zipcode: formValue.cep,
        street: formValue.logradouro,
        neighborhood: formValue.bairro,
        city: formValue.cidade,
        state: formValue.estado,
        number: formValue.numero,
        complement: formValue.complemento
      }
    };

    this.budgetService.postBudget(budget).subscribe({
      next: (res) => {
        this.showToast('success', 'Sucesso', 'Orçamento criado com sucesso!');
        setTimeout(() => {
          this.router.navigate([`/budget/${res.id}`]);
        }, 1000);
      },
      error: (err) => {
        const response: ValidationErrorResponse = err.error

        const mensagensErro = response.errors
            .map(e => `${e.message}`)
            .join('<br>');


        this.showToast('error', "Erro ao registrar orçamento", mensagensErro)
      },
    });
  }


  showToast(severity:string,
     summary:string,
     detail:string,
     sticky:boolean = false,
     contentStyleClass:string = '',
     data?:any,
     redirectToWpp:boolean = false) : void{

    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      sticky: sticky,
      contentStyleClass: contentStyleClass,
      data: data
    });

  this.redirectWpp = redirectToWpp

  }

  getBudgetById(budgetId:string):void{
    this.budgetService.getAllServiceTypes()
    .pipe(
      tap((serviceTypes: ServiceTypeBudget[]) => {
        this.serviceTypes = serviceTypes;
      }),
      switchMap(() => this.budgetService.getBudgetById(budgetId))
    )
    .subscribe(response => {
      this.budgetData = response;
      // preencher a lista de intentions com base no serviço
      const selectedService = this.serviceTypes.find(s => s.id === response.serviceType.id);
      this.intentions = selectedService?.intentionServices || [];

      // seta os valores no formulário
      this.form.patchValue({
        cep: response.address.zipcode,
        bairro: response.address.neighborhood,
        logradouro: response.address.street,
        cidade: response.address.city,
        estado: response.address.state,
        numero: response.address.number,
        complemento: response.address.complement,
        area: response.budgetAreaSettings.area_Size,
        unitOfMeasure: response.budgetAreaSettings.unitOfMeasure,
        servico: response.serviceType.id,
        detalheServico: response.intentionService?.name,
        confrontations: response.confrontations,
        price: response.price
      });

      // deixar todos os campos do formulário como readonly
      this.form.disable();
    });
  }

  generatePdf(): void {
    if (!this.budgetData) {
      this.showToast('error', 'Erro', 'Dados do orçamento não disponíveis.');
      return;
    }
    try {
      this.budgetPdfService.generatePdf(this.budgetData);
    } catch (error) {
      this.showToast('error', 'Erro', 'Falha ao gerar o PDF. Tente novamente.');
    }
  }
}
