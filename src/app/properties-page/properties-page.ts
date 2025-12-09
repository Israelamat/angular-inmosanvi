import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Property } from '../interfaces/propoerty';
import { PropertyForm } from '../property-form/property-form';
import { PropertyCard } from '../property-card/property-card';

@Component({
  selector: 'properties-page',
  imports: [FormsModule, PropertyForm, PropertyCard],
  templateUrl: './properties-page.html',
  styleUrl: './properties-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesPage {
  filename: string = "";
  properties = signal<Property[]>([]);

  search = signal('');
  province = signal('');

  filteredProperties = computed(() => {
    const props = this.properties();
    const text = this.search().toLowerCase();
    const prov = this.province();

    return props.filter(p => {
      const matchSearch =
        p.title.toLowerCase().includes(text) ||
        p.address.toLowerCase().includes(text);

      const matchProvince =
        prov ? p.province === prov : true;

      return matchSearch && matchProvince;
    });
  });

  addProperty(newProperty: Property) {
    this.properties.set([...this.properties(), newProperty]);
  }

  deleteProperty(id: number | undefined) {
    this.properties.set(this.properties().filter(p => p.id !== id));
  }
}
