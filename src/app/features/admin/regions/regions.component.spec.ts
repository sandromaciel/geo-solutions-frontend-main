import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegionsComponent } from './regions.component';
import { CityService, City } from './services/city.service';
import { CitySearchComponent } from './components/city-search/city-search.component';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('RegionsComponent', () => {
  let component: RegionsComponent;
  let fixture: ComponentFixture<RegionsComponent>;
  let cityServiceMock: jasmine.SpyObj<CityService>;

  const mockCities: City[] = [
    { id: 1, name: 'Belo Horizonte', state: 'MG' },
    { id: 2, name: 'Contagem', state: 'MG' },
  ];

  beforeEach(async () => {
    cityServiceMock = jasmine.createSpyObj('CityService', ['getAllCities', 'removeCity', 'addCity']);
    cityServiceMock.getAllCities.and.returnValue(of(mockCities));
    cityServiceMock.removeCity.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LucideAngularModule,
        HttpClientTestingModule,
        RegionsComponent,
        CitySearchComponent,
      ],
      providers: [
        { provide: CityService, useValue: cityServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state and call loadServingCities on ngOnInit', () => {
    spyOn(component, 'loadServingCities');
    component.ngOnInit();
    expect(component.loadServingCities).toHaveBeenCalled();
  });

  it('should load cities successfully and update state', fakeAsync(() => {
    component.loadServingCities();
    tick();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeNull();
    expect(component.servingCities).toEqual(mockCities);
    expect(cityServiceMock.getAllCities).toHaveBeenCalled();
  }));

  it('should handle error when loading cities fails with status 0', fakeAsync(() => {
    const error = { status: 0 };
    cityServiceMock.getAllCities.and.returnValue(throwError(() => error));
    component.loadServingCities();
    tick();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe(
      'Não foi possível conectar ao servidor. Verifique se o servidor está ativo e se a URL está correta (HTTP/HTTPS).'
    );
    expect(component.servingCities).toEqual([]);
  }));

  it('should handle error when loading cities fails with non-zero status', fakeAsync(() => {
    const error = { status: 500 };
    cityServiceMock.getAllCities.and.returnValue(throwError(() => error));
    component.loadServingCities();
    tick();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe(
      'Não foi possível carregar as cidades. Tente novamente mais tarde.'
    );
    expect(component.servingCities).toEqual([]);
  }));

  it('should call loadServingCities when handleAddCity is triggered', () => {
    spyOn(component, 'loadServingCities');
    const newCity: City = { id: 3, name: 'Betim', state: 'MG' };
    component.handleAddCity(newCity);
    expect(component.loadServingCities).toHaveBeenCalled();
  });

  it('should initiate city removal and show confirmation', () => {
    const city: City = mockCities[0];
    component.initiateRemoveCity(city);
    expect(component.cityToRemove).toBe(city);
    expect(component.showRemoveConfirmation).toBeTrue();
  });

  it('should confirm city removal, reload cities, and reset state', fakeAsync(() => {
    spyOn(window, 'alert');
    spyOn(component, 'loadServingCities');
    const city: City = mockCities[0];
    component.cityToRemove = city;
    component.showRemoveConfirmation = true;
    component.confirmRemoveCity();
    tick();
    expect(cityServiceMock.removeCity).toHaveBeenCalledWith(city.id);
    expect(component.loadServingCities).toHaveBeenCalled();
    expect(component.showRemoveConfirmation).toBeFalse();
    expect(component.cityToRemove).toBeNull();
    expect(window.alert).toHaveBeenCalledWith('Cidade removida com sucesso!');
  }));

  it('should handle error during city removal', fakeAsync(() => {
    spyOn(window, 'alert');
    const error = { message: 'Failed to remove city' };
    cityServiceMock.removeCity.and.returnValue(throwError(() => error));
    const city: City = mockCities[0];
    component.cityToRemove = city;
    component.showRemoveConfirmation = true;
    component.confirmRemoveCity();
    tick();
    expect(cityServiceMock.removeCity).toHaveBeenCalledWith(city.id);
    expect(component.showRemoveConfirmation).toBeFalse();
    expect(component.cityToRemove).toBeNull();
    expect(window.alert).toHaveBeenCalledWith('Failed to remove city');
  }));

  it('should cancel city removal and reset state', () => {
    component.cityToRemove = mockCities[0];
    component.showRemoveConfirmation = true;
    component.cancelRemoveCity();
    expect(component.showRemoveConfirmation).toBeFalse();
    expect(component.cityToRemove).toBeNull();
  });

  it('should render loading message when isLoading is true', () => {
    component.isLoading = true;
    component.servingCities = [];
    component.errorMessage = null;
    fixture.detectChanges();
    const loadingElement = fixture.debugElement.query(By.css('div.text-center.py-4'));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain('Carregando cidades...');
  });

  it('should render error message when errorMessage is set', () => {
    component.errorMessage = 'Test error message';
    component.isLoading = false;
    component.servingCities = [];
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(By.css('.text-red-500.text-center.py-4'));
    expect(errorElement).toBeTruthy();
    expect(errorElement.nativeElement.textContent).toContain('Test error message');
  });

  it('should render cities list when cities are loaded', () => {
    component.servingCities = mockCities;
    component.isLoading = false;
    component.errorMessage = null;
    fixture.detectChanges();
    const cityElements = fixture.debugElement.queryAll(By.css('ul.grid li.flex.items-center.space-x-2.p-2'));
    expect(cityElements.length).toBe(mockCities.length);
    expect(cityElements[0].nativeElement.textContent).toContain('Belo Horizonte');
    expect(cityElements[1].nativeElement.textContent).toContain('Contagem');
  });

  it('should render confirmation modal when showRemoveConfirmation is true', () => {
    component.showRemoveConfirmation = true;
    component.cityToRemove = mockCities[0];
    fixture.detectChanges();
    const modalElement = fixture.debugElement.query(By.css('.fixed.inset-0.bg-black.bg-opacity-50'));
    expect(modalElement).toBeTruthy();
    const modalContent = fixture.debugElement.query(By.css('.p-6.rounded-md.text-center'));
    expect(modalContent).toBeTruthy();
    expect(modalContent.nativeElement.textContent).toContain('Remover Belo Horizonte da lista?');
  });

  it('should handle add city event from CitySearchComponent', () => {
    const newCity: City = { id: 3, name: 'Betim', state: 'MG' };
    spyOn(component, 'handleAddCity');
    const citySearchComponent = fixture.debugElement.query(By.directive(CitySearchComponent));
    citySearchComponent.triggerEventHandler('addCity', newCity);
    expect(component.handleAddCity).toHaveBeenCalledWith(newCity);
  });

  it('should render a newly added city in the list', () => {
    const newCity: City = { id: 3, name: 'Betim', state: 'MG' };
    component.servingCities = [...mockCities, newCity];
    fixture.detectChanges();
    const cityElements = fixture.debugElement.queryAll(By.css('ul.grid li.flex.items-center.space-x-2.p-2'));
    expect(cityElements.length).toBe(mockCities.length + 1);
    expect(cityElements[2].nativeElement.textContent).toContain('Betim');
  });
});