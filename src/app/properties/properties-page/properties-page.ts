import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, linkedSignal, signal } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { PropertiesService } from '../../services/properties-service';
import { Property, PropertyInsert, Province, Town } from '../../interfaces/propoerty';
import { PropertyForm } from '../property-form/property-form';
import { PropertyCard } from '../property-card/property-card';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ProvincesService } from '../../services/provinces-service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'properties-page',
  imports: [FormsModule, PropertyCard],
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

  searchControl = new FormControl('');
  searchSignal = toSignal(this.searchControl.valueChanges.pipe(debounceTime(600)));
  allProperties: Property[] = [];
  filteredProperties = signal<Property[]>([]);

  constructor() {
    effect(() => {
      const allProps = this.propertiesResource.value()?.properties || [];
      const query = (this.searchSignal() || '').toLowerCase();

      this.filteredProperties.set(
        allProps.filter(p => p.title.toLowerCase().includes(query))
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

  deleteProperty(id?: number) {
    if (!id) return;

    this.propertiesService.deleteProperty(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
