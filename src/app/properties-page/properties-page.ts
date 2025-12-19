import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertiesService } from '../services/properties-service';
import { Property, PropertyInsert, Province, Town } from '../interfaces/propoerty';
import { PropertyForm } from '../property-form/property-form';
import { PropertyCard } from '../property-card/property-card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProvincesService } from '../services/provinces-service';

@Component({
  selector: 'properties-page',
  imports: [FormsModule, PropertyForm, PropertyCard],
  templateUrl: './properties-page.html',
  styleUrls: ['./properties-page.css'],

})
export class PropertiesPage {
  private propertiesService = inject(PropertiesService);
  private provincesService = inject(ProvincesService);
  private destroyRef = inject(DestroyRef);
  filename: string = "";

  search = signal('');
  province = signal('');
  towns = signal<Town[]>([]);
  provinceId = signal(0);
  provinces = signal<Province[]>([]);

  propertiesResource = this.propertiesService.propertiesResource;
  properties = linkedSignal(() => this.propertiesService.propertiesResource.value()?.properties ?? []);


  constructor() {
    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);
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


  addProperty(propertyInsert: PropertyInsert) {
    this.propertiesService.addProperty(propertyInsert)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newProp) => {
          this.properties.update(list => [newProp.property, ...list]);
        },
        error: err => console.error('Error adding property', err)
      });
  }

  deleteProperty(id?: number) {
    if (!id) return;

    this.propertiesService.deleteProperty(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.properties.update(list =>
            list.filter(p => p.id !== id)
          );
        },
        error: err => console.error(err)
      });
  }

}
