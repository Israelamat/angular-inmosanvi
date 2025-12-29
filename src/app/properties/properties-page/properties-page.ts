import { Component, DestroyRef, effect, inject, linkedSignal, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PropertiesService } from '../../services/properties-service';
import { Property, Province, Town } from '../../interfaces/propoerty';
import { PropertyCard } from '../property-card/property-card';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ProvincesService } from '../../services/provinces-service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'properties-page',
  imports: [FormsModule, PropertyCard, ReactiveFormsModule],
  templateUrl: './properties-page.html',
  styleUrls: ['./properties-page.css'],

})
export class PropertiesPage {
  private propertiesService = inject(PropertiesService);
  private provincesService = inject(ProvincesService);
  private destroyRef = inject(DestroyRef);
  filename: string = "";

  province = signal('');
  towns = signal<Town[]>([]);
  provinceId = signal(0);
  provinces = signal<Province[]>([]);

  propertiesResource = this.propertiesService.propertiesResource;
  properties = linkedSignal(() => this.propertiesService.propertiesResource.value()?.properties ?? []);

  searchControl = new FormControl('');
  searchSignal = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(600)),
    { initialValue: '' }
  );
  allProperties: Property[] = [];
  filteredProperties = signal<Property[]>([]);

  constructor() {

    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);
    });

    effect(() => {
      const allProps = this.properties() || [];
      const query = (this.searchSignal() || '').toLowerCase().trim();
      const selectedProvinceId = this.provinceId();

      this.filteredProperties.set(
        allProps.filter(p => {
          const titleMatch = p.title?.toLowerCase().includes(query);
          const addressMatch = p.address?.toLowerCase().includes(query);
          const provinceMatch = selectedProvinceId === 0 || p.town?.province?.id === selectedProvinceId;

          return (titleMatch || addressMatch) && provinceMatch;
        })
      );
    });

    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);

      const id = this.provinceId();
      const selected = this.provinces().find(p => p.id === id);
      this.province.set(selected?.name || 'All');
    });
  }

   setProvince(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.provinceId.set(+select.value);
    }
  }

  deleteProperty(id?: number) {
    if (!id) return;

    this.propertiesService.deleteProperty(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
