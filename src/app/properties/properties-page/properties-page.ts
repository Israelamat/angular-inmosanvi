import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, linkedSignal, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertiesService } from '../../services/properties-service';
import { Property, Province, Town } from '../../interfaces/propoerty';
import { PropertyCard } from '../property-card/property-card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProvincesService } from '../../services/provinces-service';
import { AuthService } from '../../services/auth.service';
import { map, Observable } from 'rxjs';

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
  filename: string = "";

  search = signal('');
  province = signal('');
  towns = signal<Town[]>([]);
  provinceId = signal(0);
  provinces = signal<Province[]>([]);

  propertiesResource = this.propertiesService.propertiesResource;
  properties = linkedSignal(() => this.propertiesService.propertiesResource.value()?.properties ?? []);

  canDelete(property?: Property): WritableSignal<boolean> {
    console.log(property?.mine ?? false);
    return signal(property?.mine ?? false);
  }


  constructor() {
    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);

      const id = this.provinceId();
      const selected = this.provinces().find(p => p.id === id);
      this.province.set(selected?.name || 'All');
    });
  }


  filteredProperties = computed(() => {
    const text = (this.search() ?? '').toLowerCase().trim();
    const selectedProvinceId = this.provinceId();

    return this.properties().filter((p: Property) => {
      const propTitle = (p.title ?? '').toLowerCase();
      const propAddress = (p.address ?? '').toLowerCase();
      const propProvinceId = p.town?.province?.id ?? 0;

      const matchSearch = propTitle.includes(text) || propAddress.includes(text);
      const matchProvince = selectedProvinceId === 0 || propProvinceId === selectedProvinceId;

      return matchSearch && matchProvince;
    });
  });

  deleteProperty(id?: number) {
    if (!id) return;

    this.propertiesService.deleteProperty(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
