import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyInsert, Province, Town, PropertyFormModel } from '../../interfaces/propoerty';
import { FormsModule } from '@angular/forms';
import { EncodeBase64Directive } from '../../directives/encode-base64';
import { ProvincesService } from '../../services/provinces-service';
import { PropertiesService } from '../../services/properties-service';
import { form, required, min, minLength, pattern, Field } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { max } from 'rxjs';
import { LoadButton } from '../../load-button/load-button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-property-form',
  imports: [FormsModule, EncodeBase64Directive, Field, CommonModule, LoadButton],
  templateUrl: './property-form.html',
  styleUrls: ['./property-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grow flex flex-col' }
})
export class PropertyForm {
  imagePreview = signal<string>("");
  filename: string = "";
  private provincesService = inject(ProvincesService);
  private propertiesService = inject(PropertiesService);
  private router = inject(Router);

  provinces = signal<Province[]>([]);
  towns = signal<Town[]>([]);
  provinceIdField = signal<string>('0');
  townIdField = signal<string>('0');
  isSubmitting = signal(false);

  newProperty = signal<PropertyFormModel>({
    title: '',
    description: '',
    price: 0,
    address: '',
    sqmeters: 0,
    numRooms: 0,
    numBaths: 0,
    townId: '0',
    mainPhoto: '',
    provinceId: '0',
  });

  pristine = signal(true);
  propertyCreated = signal(false);

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
    required(schema.mainPhoto, { message: 'Image is required' });

    required(schema.provinceId, { message: 'Province is required' });
    pattern(schema.provinceId, /^[1-9]\d*$/, { message: 'Select a valid province' });

    required(schema.townId, { message: 'Town is required' });
    pattern(schema.townId, /^[1-9]\d*$/, { message: 'Select a valid town' });
  });

  isFormValid = computed(() => {
    const fields = [
      this.propertyForm.title(),
      this.propertyForm.description(),
      this.propertyForm.address(),
      this.propertyForm.price(),
      this.propertyForm.sqmeters(),
      this.propertyForm.numRooms(),
      this.propertyForm.numBaths(),
      this.propertyForm.mainPhoto(),
      this.propertyForm.provinceId(),
      this.propertyForm.townId(),
    ];
    fields.forEach(f => {
      //console.log(f.errors());
    });
    return fields.every(f => !(f.errors()?.length));

  });

  constructor() {
    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);
    });

    const provinceIdSignal = computed(() => {
      const value = this.propertyForm.provinceId().value();
      return +value;
    });
    const townsResource = this.provincesService.getTownsResource(provinceIdSignal);

    effect(() => {
      provinceIdSignal();
      untracked(() => {
        this.propertyForm.townId().value.set('0');
      });

      const resp = townsResource.value();
      this.towns.set(resp ? resp.towns : []);
    });

    effect(() => { this.pristine.set(false); });
  }

  addProperty(event: Event) {
    event.preventDefault();
    if (!this.isFormValid()) return;
    this.isSubmitting.set(true);
    setTimeout(() => {
    Swal.fire('Éxito', 'Propiedad guardada', 'success');
  }, 1500);
    const raw = this.newProperty();
    const payload: PropertyInsert = {
      title: raw.title,
      description: raw.description,
      price: raw.price,
      address: raw.address,
      sqmeters: raw.sqmeters,
      numRooms: raw.numRooms,
      numBaths: raw.numBaths,
      townId: +raw.townId,        // conversión a number 
      mainPhoto: raw.mainPhoto,
      provinceId: +raw.provinceId // conversión a number
    };

    if (!this.isFormValid()) return;

    this.propertiesService.addProperty(payload).subscribe({
      next: (created) => {
        this.propertyCreated.set(true);
        this.router.navigate(['/properties', created.property.id]);
      },
      error: (err) => {console.error('Error adding property', err);
        this.isSubmitting.set(false);
      }
    });
  }

  changeImage(fileInput: HTMLInputElement) {
    if (!fileInput.files?.length) {
      this.imagePreview.set('');
      this.newProperty.update(p => ({ ...p, mainPhoto: '' }));
      fileInput.value = '';
      return;
    }

    const file = fileInput.files[0];
    this.filename = file.name;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview.set(base64);
      this.newProperty.update(p => ({ ...p, mainPhoto: base64 }));
    };
  }

  canDeactivate(): boolean {
    return this.propertyCreated() || this.pristine();
  }
}
