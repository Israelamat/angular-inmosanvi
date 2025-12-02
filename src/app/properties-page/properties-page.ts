import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
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

  properties: Property[] = [];

  addProperty(newProperty: Property) {
    this.properties.push(newProperty);
  }

  deleteProperty(id: number | undefined) {
    this.properties = this.properties.filter(property => property.id !== id);
  }
}
