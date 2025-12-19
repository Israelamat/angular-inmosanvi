import { ChangeDetectionStrategy, Component, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { PropertyInsert, Province, Town } from '../interfaces/propoerty';
import { FormsModule } from '@angular/forms';
import { EncodeBase64Directive } from '../directives/encode-base64';
import { ProvincesService } from '../services/provinces-service';

@Component({
  selector: 'app-property-form',
  imports: [FormsModule, EncodeBase64Directive],
  templateUrl: './property-form.html',
  styleUrl: './property-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class PropertyForm {
  @Output() added = new EventEmitter<PropertyInsert>();
  imagePreview = signal<string>("");
  filename: string = "";
  private provincesService = inject(ProvincesService);
  province = signal('');
  towns = signal<Town[]>([]);
  provinceId = signal(0);
  provinces = signal<Province[]>([]);

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

  addProperty() {
    this.added.emit(this.newProperty);
    this.newProperty = {
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

    this.imagePreview.set("");
    this.filename = "";
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
