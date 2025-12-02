import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { Property } from '../interfaces/propoerty';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-form',
  imports: [FormsModule],
  templateUrl: './property-form.html',
  styleUrl: './property-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class PropertyForm {
  @Output() added = new EventEmitter<Property>();
  imagePreview = signal<string>("");
  lastId: number = 1;
  filename: string = "";

  newProperty: Property = {
    province: '',
    town: '',
    address: '',
    title: '',
    price: 0,
    sqmeters: 0,
    numRooms: 0,
    numBaths: 0,
    mainPhoto: '',
  };

  addProperty() {
    this.newProperty.mainPhoto = this.imagePreview();
    this.newProperty.id = this.lastId++;
    this.added.emit(this.newProperty);
    this.newProperty = {
      province: '',
      town: '',
      address: '',
      title: '',
      price: 0, 
      sqmeters: 0,
      numRooms: 0,
      numBaths: 0,
      mainPhoto: '',
    }
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
