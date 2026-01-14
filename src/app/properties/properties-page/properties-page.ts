import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, linkedSignal, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertiesService } from '../../services/properties-service';
import { PropertiesResponse, Property, Province, Town } from '../../interfaces/propoerty';
import { PropertyCard } from '../property-card/property-card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProvincesService } from '../../services/provinces-service';
import { AuthService } from '../../services/auth.service';
import { debounce, debounceTime, map, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { form } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';

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

  filename: string = "";

  search = signal('');
  province = signal('');
  towns = signal<Town[]>([]);
  provinceId = signal(0);
  provinces = signal<Province[]>([]);
  page = signal(1);
  sellerId = signal<number | null>(null);

  searchField = form(this.search, schema => {
    return debounceTime(600);
  });

  propertiesResource = this.propertiesService.getPropertiesResource(this.search, this.provinceId,
    this.page,   this.sellerId);

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
    const provinces = this.provinces();
    return provinces.find(p => p.id === id)?.name ?? 'All';
  });

  constructor() {
    this.authService.isLogged().subscribe();  //Handle page reload

    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);

      const id = this.provinceId();
      const selected = this.provinces().find(p => p.id === id);
      this.province.set(selected?.name || 'All');
    });

    effect(() => {
      if (!this.authService.logged()) return;

      this.propertiesResource.reload();
      this.authService.getMe();
    });

    effect(() => {
      this.route.queryParams.subscribe(params => {
        this.sellerId.set(params['seller'] ? +params['seller'] : null);
      });
    });

  }

  onProvinceChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = Number(select.value);
    this.provinceId.set(Number.isNaN(value) ? 0 : value);
    console.log('Selected provinceId numeric:', this.provinceId());
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
  }

  loadMore() {
    this.page.update(p => p + 1);
  }

  deleteProperty(id?: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        if (!id) return;
        this.propertiesService.deleteProperty(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    })
  }

  canDelete(property?: Property): WritableSignal<boolean> {
    return signal(property?.mine ?? false);
  }
}
