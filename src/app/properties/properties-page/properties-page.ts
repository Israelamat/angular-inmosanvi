import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  linkedSignal,
  signal,
  WritableSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertiesService } from '../../services/properties-service';
import { PropertiesResponse, Property, Province, Town } from '../../interfaces/propoerty';
import { PropertyCard } from '../property-card/property-card';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ProvincesService } from '../../services/provinces-service';
import { AuthService } from '../../services/auth.service';
import { debounceTime, map } from 'rxjs';
import Swal from 'sweetalert2';
import { form } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from '../../app.routes';

@Component({
  selector: 'properties-page',
  imports: [FormsModule, PropertyCard],
  templateUrl: './properties-page.html',
  styleUrls: ['./properties-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertiesPage {

  private propertiesService = inject(PropertiesService);
  private provincesService = inject(ProvincesService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  search = signal('');
  provinceId = signal(0);
  provinces = signal<Province[]>([]);
  page = signal(1);
  searchField = form(this.search, () => debounceTime(600));

  private syncProvinces = effect(() => {
    const resp = this.provincesService.provincesResource.value();
    if (resp) {
      this.provinces.set(resp.provinces);
    }
  });

  private reloadOnLogin = effect(() => {
    if (this.authService.logged()) {
      this.propertiesResource.reload();
      this.authService.getMe();
    }
  });

  constructor() {
    this.authService.isLogged().subscribe(); //handle reload page 
    effect(() => console.log(this.search()));
  }

  sellerId = toSignal(
    this.route.queryParams.pipe(
      map(params => params['seller'] ? +params['seller'] : null)
    ),
    { initialValue: null }
  );

  propertiesResource = this.propertiesService.getPropertiesResource(
    this.search,
    this.provinceId,
    this.page,
    this.sellerId
  );

  properties = linkedSignal<PropertiesResponse | undefined, Property[]>({
    source: () => this.propertiesResource.value(),
    computation: (resp, previous) => {
      if (!resp) return previous?.value ?? [];
      return this.page() > 1 && previous
        ? previous.value.concat(resp.properties)
        : resp.properties;
    }
  });

  provinceName = computed(() => {
    const id = this.provinceId();
    return this.provinces().find(p => p.id === id)?.name ?? 'All';
  });

  onProvinceChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.provinceId.set(Number.isNaN(value) ? 0 : value);
  }

  onSearchInput(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  loadMore() {
    this.page.update(p => p + 1);
  }

  deleteProperty(id?: number) {
    if (!id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then(result => {
      if (result.isConfirmed) {
        this.propertiesService.deleteProperty(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    });
  }

  canDelete(property?: Property): WritableSignal<boolean> {
    return signal(property?.mine ?? false);
  }
}
