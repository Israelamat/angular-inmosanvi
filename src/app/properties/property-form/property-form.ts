import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyInsert, Province, Town } from '../../interfaces/propoerty';
import { FormsModule } from '@angular/forms';
import { EncodeBase64Directive } from '../../directives/encode-base64';
import { ProvincesService } from '../../services/provinces-service';
import { PropertiesService } from '../../services/properties-service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-property-form',
  imports: [FormsModule, EncodeBase64Directive],
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
  provinceId = signal(0);
  provinces = signal<Province[]>([]);

  propertyCreated = signal(false);

  newProperty: PropertyInsert = {
    title: '',
    description: '',
    price: 0,
    address: '',
    sqmeters: 0,
    numRooms: 0,
    numBaths: 0,
    townId: 0,
    mainPhoto: '',
  };

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
        this.newProperty.townId = 0;
      } else {
        this.towns.set([]);
        this.newProperty.townId = 0;
      }
    });
  }

  addProperty() {
    this.propertiesService.addProperty(this.newProperty)
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
