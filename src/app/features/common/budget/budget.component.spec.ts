import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetComponent } from './budget.component';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BudgetService } from '../../../core/services/budget.service';
import { AuthService } from '../../../core/services/auth.service';
import { ViaCepService } from '../../admin/regions/services/via-cep.service';
import { MessageService } from 'primeng/api';
import { ServiceTypeBudget } from '../../../core/models/budget/serviceTypeBudget/service.Type.Budget.model';
import { AddressResponse } from '../../../core/models/budget/response/address.response.model';
import { IntentionService } from '../../admin/service-manager/services/intention.service';
import { UserType } from '../../../core/models/register.model';
import { EUnitOfMeasure } from '../../../core/enums/EUnitOfMeausre';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let fixture: ComponentFixture<BudgetComponent>;
  let budgetServiceSpy: jasmine.SpyObj<BudgetService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let viaCepServiceSpy: jasmine.SpyObj<ViaCepService>;
  let messageService: MessageService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const budgetSpy = jasmine.createSpyObj('BudgetService', [
      'getAllServiceTypes',
      'processCalc',
      'postBudget',
      'checkCityCoverageByIbge',
      'fetchAddressByCep'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUserIdFromToken']);
    const viaCepSpy = jasmine.createSpyObj('ViaCepService', ['getCityIbgeIdByCep']);
    const routeStub = { snapshot: { paramMap: new Map() } };
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BudgetComponent],
      providers: [
        FormBuilder,
        MessageService,
        { provide: BudgetService, useValue: budgetSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ViaCepService, useValue: viaCepSpy },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    // Injeta os spies
    budgetServiceSpy = TestBed.inject(BudgetService) as jasmine.SpyObj<BudgetService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    viaCepServiceSpy = TestBed.inject(ViaCepService) as jasmine.SpyObj<ViaCepService>;
    messageService = TestBed.inject(MessageService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock necessário para evitar erro de subscribe em ngOnInit
    budgetServiceSpy.getAllServiceTypes.and.returnValue(of([]));

    fixture = TestBed.createComponent(BudgetComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch service types on init', () => {
    const mockServiceTypes: ServiceTypeBudget[] = [{ id: 1, name: 'Serviço X', intentionServices: [], description: "test" }];
    budgetServiceSpy.getAllServiceTypes.and.returnValue(of(mockServiceTypes));

    component.getServiceTypes();

    expect(component.serviceTypes.length).toBe(1);
    expect(component.serviceTypes[0].name).toBe('Serviço X');
  });

  it('should show toast if user is not authenticated during cálculo', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.processarCalculo();

    expect(component.redirectWpp).toBeFalse();
  });


  it('should enable fields after valid CEP with coverage', () => {
    component.form.patchValue({ cep: '30130010' });
    viaCepServiceSpy.getCityIbgeIdByCep.and.returnValue(of(3106200));
    budgetServiceSpy.checkCityCoverageByIbge.and.returnValue(of(true));
    budgetServiceSpy.fetchAddressByCep.and.returnValue(of({
      id: 1,
      complement: "Casa",
      number: 319,
      zipcode: "32044160",
      street: 'Rua X',
      neighborhood: 'Bairro Y',
      city: 'Cidade Z',
      state: 'MG'
    } as AddressResponse));

    component.getAddressByCep();

    expect(viaCepServiceSpy.getCityIbgeIdByCep).toHaveBeenCalledWith('30130010');
  });
  it('should set error toast when processCalc fails', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    component.form.patchValue({
      servico: 1,
      detalheServico: 'Teste',
      area: 100,
      unitOfMeasure: 'SquareMeter',
      logradouro: 'Rua A',
      bairro: 'Bairro A',
      cidade: 'Cidade A',
      estado: 'Estado A',
      numero: 123,
      confrontations: 0
    });

    budgetServiceSpy.processCalc.and.returnValue(throwError(() => ({
      error: { errors: [{ message: 'Erro teste' }] }
    })));

    component.intentions = [{
      id: 1,
      name: 'Teste',
      description: 'Descrição do serviço',
      limit_Area: 100,
      daily_Price: 200,
      urbanConfrontation: true,
      ruralConfrontation: false
    }];
    component.processarCalculo();

    expect(budgetServiceSpy.processCalc).toHaveBeenCalled();
  });

  //////////////////////////////////////////////////////////////////


  it('should populate address fields after successful CEP lookup', () => {
    const mockAddress: AddressResponse = {
      id: 1,
      complement: 'Casa',
      number: 123,
      zipcode: '30130010',
      street: 'Rua XPTO',
      neighborhood: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG'
    };
    component.form.get('cep')?.setValue('30130010');
    viaCepServiceSpy.getCityIbgeIdByCep.and.returnValue(of(3106200));
    budgetServiceSpy.checkCityCoverageByIbge.and.returnValue(of(true));
    budgetServiceSpy.fetchAddressByCep.and.returnValue(of(mockAddress));

    component.getAddressByCep();

    expect(component.form.get('logradouro')?.value).toBe('Rua XPTO');
    expect(component.form.get('bairro')?.value).toBe('Centro');
    expect(component.form.get('cidade')?.value).toBe('Belo Horizonte');
    expect(component.form.get('estado')?.value).toBe('MG');
  });

  it('should not process calculation if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.processarCalculo();

    expect(component.redirectWpp).toBeFalse();

  });

  it('should populate service types correctly from service', () => {
    const mockServiceTypes: ServiceTypeBudget[] = [
      { id: 1, name: 'Serviço A', intentionServices: [], description: 'Descrição A' },
      { id: 2, name: 'Serviço B', intentionServices: [], description: 'Descrição B' }
    ];

    budgetServiceSpy.getAllServiceTypes.and.returnValue(of(mockServiceTypes));
    component.getServiceTypes();

    expect(component.serviceTypes.length).toBe(2);
    expect(component.serviceTypes[0].name).toBe('Serviço A');
    expect(component.serviceTypes[1].name).toBe('Serviço B');
  });
});

