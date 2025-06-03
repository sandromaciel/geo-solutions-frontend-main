import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CityService } from '../../services/city.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { City, IbgeService } from '../../services/ibge.service';
import { LucideAngularModule, Search } from 'lucide-angular';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-city-search',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './city-search.component.html',
  styleUrls: [],
})
export class CitySearchComponent implements OnInit, OnDestroy {
  @Output() addCity = new EventEmitter<City>();
  query: string = '';
  searchResults: City[] = [];
  isResultsVisible: boolean = false;
  selectedCity: City | null = null;
  showConfirmation: boolean = false;
  searchIcon = Search;
  @ViewChild('searchRef') searchRef!: ElementRef;

  private searchSubject = new Subject<string>();
  private subscription: Subscription = new Subscription();

  constructor(
    private ibgeService: IbgeService,
    private cityService: CityService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.searchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((query) => this.ibgeService.searchCities(query))
        )
        .subscribe({
          next: (results) => {
            this.searchResults = results;
            this.isResultsVisible = results.length > 0;
          },
          error: (err) => {
            console.error('Erro ao buscar cidades:', err);
            this.toastService.showError(
              'Erro ao buscar cidades. Verifique sua conexão ou tente novamente mais tarde.'
            );
            this.searchResults = [];
            this.isResultsVisible = false;
          },
        })
    );
  
    document.addEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  handleQueryChange(event: Event) {
    const newQuery = (event.target as HTMLInputElement).value;
    this.query = newQuery;
    this.searchSubject.next(newQuery);
  }

  handleSelectCity(city: City) {
    this.selectedCity = city;
    this.showConfirmation = true;
    this.isResultsVisible = false;
  }

  confirmAddCity() {
    if (this.selectedCity) {
      this.cityService.addCity(this.selectedCity).subscribe({
        next: (result) => {
          this.addCity.emit(result);
          this.query = '';
          this.searchResults = [];
          this.isResultsVisible = false;
          this.selectedCity = null;
          this.showConfirmation = false;
          this.toastService.showSuccess(`${result.name} foi adicionada com sucesso!`);
        },
        error: (err) => {
          console.error('Erro ao adicionar cidade:', err);
          const errorMessage =
            err.status === 409
              ? 'Essa cidade já está cadastrada.'
              : err.message || 'Erro ao adicionar cidade. Tente novamente.';
          this.toastService.showError(errorMessage);
          this.showConfirmation = false;
          this.selectedCity = null;
        },
      });
    }
  }

  cancelAddCity() {
    this.selectedCity = null;
    this.showConfirmation = false;
  }

  handleFocus() {
    if (this.searchResults.length > 0) {
      this.isResultsVisible = true;
    }
  }

  handleClickOutside(event: MouseEvent) {
    if (
      this.searchRef &&
      !this.searchRef.nativeElement.contains(event.target)
    ) {
      this.isResultsVisible = false;
    }
  }

  ngOnDestroy() {
    document.removeEventListener(
      'mousedown',
      this.handleClickOutside.bind(this)
    );
    this.subscription.unsubscribe();
  }
}
