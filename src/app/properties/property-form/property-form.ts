import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyInsert, Province, Town } from '../../interfaces/propoerty';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncodeBase64Directive } from '../../directives/encode-base64';
import { ProvincesService } from '../../services/provinces-service';
import { PropertiesService } from '../../services/properties-service';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

@Component({
  selector: 'app-property-form',
  imports: [ReactiveFormsModule, EncodeBase64Directive],
  templateUrl: './property-form.html',
  styleUrls: ['./property-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grow flex flex-col',
  }
})
export class PropertyForm implements CanComponentDeactivate {
  imagePreview = signal<string>("");
  filename: string = "";

  private provincesService = inject(ProvincesService);
  private propertiesService = inject(PropertiesService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  province = signal('');
  towns = signal<Town[]>([]);
  provinceId = signal(0);
  provinces = signal<Province[]>([]);
  propertyCreated = signal(false);

  propertyForm = this.fb.group({
    provinceId: [0, [Validators.required, Validators.pattern('[1-9]\\d*')]],
    townId: [0, [Validators.required, Validators.pattern('[1-9]\\d*')]],
    address: ['', [Validators.required]],
    title: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')
      ]
    ],
    description: ['', [Validators.required]],
    sqmeters: [1, [Validators.required, Validators.min(1)]],
    numRooms: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    numBaths: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    price: [1, [Validators.required, Validators.min(1)]],
    mainPhoto: ['', [Validators.required]],
    filename: ['']
  });
  constructor() {
    this.propertyForm.get('provinceId')!.valueChanges.subscribe(v => {
      this.provinceId.set(v);

    });
    effect(() => {
      const resp = this.provincesService.provincesResource.value();
      if (resp) this.provinces.set(resp.provinces);
    });

    const townsResource = this.provincesService.getTownsResource(this.provinceId);
    effect(() => {
      const resp = townsResource.value();
      if (resp) {
        this.towns.set(resp.towns);
        this.propertyForm.get('townId')!.setValue(0);
      } else {
        this.towns.set([]);
        this.propertyForm.get('townId')!.setValue(0);
      }
    });

  }

  addProperty() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    const raw = this.propertyForm.getRawValue();
    const newProp: PropertyInsert = {
      title: raw.title,
      description: raw.description,
      price: raw.price,
      address: raw.address,
      sqmeters: raw.sqmeters,
      numRooms: raw.numRooms,
      numBaths: raw.numBaths,
      townId: Number(raw.townId),
      mainPhoto: raw.mainPhoto || ''
    };

    this.propertiesService.addProperty(newProp).subscribe({
      next: (created) => {
        this.propertyCreated.set(true);
        this.router.navigate(['/properties', created.property.id]);
      },
      error: (err) => console.error('Error adding property', err)
    });
  }


  changeImage(fileInput: HTMLInputElement) {
    if (!fileInput.files || fileInput.files.length === 0) {
      this.imagePreview.set('');
      this.filename = '';
      this.propertyForm.get('mainPhoto')!.setValue('');
      this.propertyForm.get('mainPhoto')!.markAsTouched();
      return;
    }

    const file = fileInput.files[0];
    this.filename = file.name;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview.set(base64);

      this.propertyForm.get('mainPhoto')!.setValue(base64);
      this.propertyForm.get('mainPhoto')!.markAsDirty();
    };
  }


  getControl(name: string) {
    return this.propertyForm.get(name)!;
  }

  canDeactivate(): boolean {
    if (this.propertyCreated() || this.propertyForm.pristine) {
      return true;
    }
    return confirm('Are you sure you want to leave? Unsaved changes will be lost.');
  }
}
