import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyInsert, Province, Town, PropertyFormModel } from '../../interfaces/propoerty';
import { EncodeBase64Directive } from '../../directives/encode-base64';
import { ProvincesService } from '../../services/provinces-service';
import { PropertiesService } from '../../services/properties-service';
import { form, required, min, minLength, pattern, Field, validate } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { LoadButton } from '../../load-button/load-button';
import Swal from 'sweetalert2';
import { OlMap } from '../../ol-maps/ol-map';
import { OlMarker } from '../../ol-maps/ol-marker';

@Component({
  selector: 'app-property-form',
  imports: [EncodeBase64Directive, Field, CommonModule, LoadButton, OlMap, OlMarker],
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
  private route = inject(ActivatedRoute);

  provinces = signal<Province[]>([]);
  towns = signal<Town[]>([]);
  provinceIdField = signal<string>('0');
  townIdField = signal<string>('0');
  isSubmitting = signal(false);
  coordinates = signal<[number, number]>([-0.5, 38.5]);
  isEditMode = computed(() => this.id() !== 0);
  id = input.required({
    alias: 'id', // El nombre del parámetro en la ruta
    transform: (v: string | undefined) => Number(v ?? 0)
  });

  // constructor() {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (id) this.propertyId.set(+id);
  // }

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
    minLength(schema.title, 4, { message: 'Title must be at least 4 characters' });
    pattern(schema.title, /^[a-zA-Z][a-zA-Z ]*$/, { message: 'Title must start with a letter and contain only letters and spaces' });

    required(schema.description, { message: 'Description is required' });
    required(schema.address, { message: 'Address is required' });
    min(schema.price, 1, { message: 'Price must be at least 1' });
    min(schema.sqmeters, 1, { message: 'Square meters must be at least 1' });
    min(schema.numRooms, 1, { message: 'Number of rooms must be at least 1' });
    min(schema.numBaths, 1, { message: 'Number of baths must be at least 1' });
    //required(schema.mainPhoto, { message: 'Image is required' });

    required(schema.provinceId, { message: 'Province is required' });
    pattern(schema.provinceId, /^[1-9]\d*$/, { message: 'Select a valid province' });

    required(schema.townId, { message: 'Town is required' });
    pattern(schema.townId, /^[1-9]\d*$/, { message: 'Select a valid town' });

    validate(schema.mainPhoto, ({ value }) => {
      if (!this.isEditMode() && !value()) {
        return { kind: 'required', message: 'Image is required' };
      }
      return null;
    });
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
    return fields.every(f => !(f.errors()?.length));

  });

  propertyResource = this.propertiesService.getPropertyResource(
    computed(() => this.id() === 0 ? undefined : this.id())
  );
  provincesEffect = effect(() => {
    const resp = this.provincesService.provincesResource.value();
    if (resp) this.provinces.set(resp.provinces);
  });

  private provinceIdSignal = computed(() => +this.propertyForm.provinceId().value());
  townsResource = this.provincesService.getTownsResource(this.provinceIdSignal);

  townsEffect = effect(() => {
    const resp = this.townsResource.value();
    const list = resp?.towns ?? [];
    this.towns.set(list);

    if (list.length > 0) {
      untracked(() => {
        const currentTownId = this.propertyForm.townId().value();
        const exists = list.some(t => String(t.id) === currentTownId);
        if (exists) {
          this.propertyForm.townId().value.set(currentTownId);
        } else if (!this.pristine()) {
          this.propertyForm.townId().value.set('0');
        }
      });
    }
  });

  propertyResourceEffect = effect(() => {
    const resp = this.propertyResource.value();
    if (!resp?.property) return;
    const p = resp.property;
    this.newProperty.set({
      title: p.title,
      description: p.description,
      price: p.price,
      address: p.address,
      sqmeters: p.sqmeters,
      numRooms: p.numRooms,
      numBaths: p.numBaths,
      provinceId: String(p.town?.province?.id ?? '0'),
      townId: String(p.town?.id ?? '0'),
      mainPhoto: p.mainPhoto,
    });
    this.imagePreview.set(p.mainPhoto ?? '');
  });

  coordinatesEffect = effect(() => {
    const townId = +this.propertyForm.townId().value();
    if (!townId) return;
    const selected = this.towns().find(t => t.id === townId);
    if (!selected) return;
    const lon = Number(selected.longitude);
    const lat = Number(selected.latitude);
    if (!Number.isNaN(lon) && !Number.isNaN(lat)) this.coordinates.set([lon, lat]);
  });

  pristineEffect = effect(() => { this.pristine.set(false); });

  submitProperty(event: Event) {
    event.preventDefault();
    if (!this.isFormValid()) return;

    this.isSubmitting.set(true);

    const raw = this.propertyForm().value();
    const payload: PropertyInsert = {
      title: raw.title,
      description: raw.description,
      price: raw.price,
      address: raw.address,
      sqmeters: raw.sqmeters,
      numRooms: raw.numRooms,
      numBaths: raw.numBaths,
      townId: +raw.townId,
      mainPhoto: raw.mainPhoto,
      provinceId: +raw.provinceId,
      status: 'selling'
    };

    const request = this.isEditMode()
      ? this.propertiesService.updateProperty(this.id()!, payload)
      : this.propertiesService.addProperty(payload);

    request.pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (res) => {
        this.propertyCreated.set(true);
        Swal.fire(
          'Success', `Property ${this.isEditMode() ? 'updated' : 'created'} successfully`, 'success'
        );
        if (this.isEditMode()) {
          this.router.navigate(['/properties']);
        } else {
          this.router.navigate(['/properties', res.property.id]);
        }
      },

      error: (err) => {
        console.error('Error saving property', err);
        if (err?.status === 403) {
          Swal.fire('Error', 'You cannot update this property because it is not yours', 'error');
        } else {
          Swal.fire('Error', 'An unexpected error occurred', 'error');
        }
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
