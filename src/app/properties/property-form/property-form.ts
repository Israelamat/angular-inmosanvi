import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyInsert, Province, Town } from '../../interfaces/propoerty';
import { FormsModule } from '@angular/forms';
import { EncodeBase64Directive } from '../../directives/encode-base64';
import { ProvincesService } from '../../services/provinces-service';
import { PropertiesService } from '../../services/properties-service';
import { form, required, min, minLength, pattern, Schema, Field } from '@angular/forms/signals';

@Component({
  selector: 'app-property-form',
  imports: [FormsModule, EncodeBase64Directive, Field],
  templateUrl: './property-form.html',
  styleUrls: ['./property-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grow flex flex-col',
  }
})
export class PropertyForm {
  imagePreview = signal<string>("");
  filename: string = "";
  private provincesService = inject(ProvincesService);
  private propertiesService = inject(PropertiesService);
  private router = inject(Router);

  province = signal('');
  towns = signal<Town[]>([]);
  townIdSelect = signal<string>('0');
  provinceId = signal(0);
  provinces = signal<Province[]>([]);

  propertyCreated = signal(false);

  newProperty = signal<PropertyInsert>({
    title: '',
    description: '',
    price: 0,
    address: '',
    sqmeters: 0,
    numRooms: 0,
    numBaths: 0,
    townId: 0,
    mainPhoto: '',
    provinceId: 0,
  });

  propertyForm = form(this.newProperty, (schema) => {
    required(schema.title, { message: 'Title is required' });
    minLength(schema.title, 5, { message: 'Title must be at least 5 characters' });
    pattern(schema.title, /^[a-zA-Z][a-zA-Z ]*$/, { message: 'Title must start with a letter and contain only letters and spaces' });

    required(schema.description, { message: 'Description is required' });
    required(schema.address, { message: 'Address is required' });

    min(schema.price, 1, { message: 'Price must be at least 1' });
    min(schema.sqmeters, 1, { message: 'Square meters must be at least 1' });

    min(schema.numRooms, 1, { message: 'Number of rooms must be at least 1' });
    min(schema.numBaths, 1, { message: 'Number of baths must be at least 1' });

    required(schema.townId, { message: 'Town is required' });
    required(schema.provinceId, { message: 'Province is required' });
    required(schema.mainPhoto, { message: 'Image is required' });
  });

  constructor() {
    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);
    });

    const townsResource = this.provincesService.getTownsResource(this.provinceId);
    effect(() => {
      const resp = townsResource.value();
      if (resp) {
        this.towns.set(resp.towns);
        this.newProperty.update(p => ({
          ...p,
          townId: 0
        }));
      } else {
        this.towns.set([]);
        this.newProperty.update(p => ({
          ...p,
          townId: 0
        }));
      }
    });
  }

  addProperty() {
    this.propertiesService.addProperty(this.newProperty())
      .subscribe({
        next: (createdProp) => {
          this.propertyCreated.set(true);
          this.router.navigate(['/properties', createdProp.property.id]);
        },
        error: (err) => console.error('Error adding property', err)
      });
  }

  changeImage(fileInput: HTMLInputElement) {
    if (!fileInput.files || fileInput.files.length === 0) {
      this.imagePreview.set("");
      return;
    }

    const reader: FileReader = new FileReader();
    reader.readAsDataURL(fileInput.files[0]);
    reader.addEventListener('loadend', () => {
      this.imagePreview.set(reader.result as string);
    });
  }
}
