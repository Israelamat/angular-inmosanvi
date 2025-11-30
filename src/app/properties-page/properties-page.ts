import { ChangeDetectorRef, Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Property } from '../interfaces/propoerty';

@Component({
  selector: 'properties-page',
  imports: [FormsModule],
  templateUrl: './properties-page.html',
  styleUrl: './properties-page.css',
})
export class PropertiesPage {
  filename: string = "";

  properties: Property[] = [];
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

  #changeDetector = inject(ChangeDetectorRef);

  private resetProperty(){
    this.newProperty = {
      id:0,
      province:"",
      town:"",
      address:"",
      title:"",
      price:0,
      sqmeters:0,
      numRooms:0,
      numBaths:0,
      mainPhoto:""
    }
    this.filename="";
  }

  changeImage(fileInput: HTMLInputElement) {
    if (!fileInput.files || fileInput.files.length === 0) {
      this.newProperty.mainPhoto = "";
      return;
    }

    const reader:FileReader = new FileReader();
    reader.readAsDataURL(fileInput.files[0]);
    reader.addEventListener('loadend', () => {
      this.newProperty.mainPhoto = reader.result as string;
      this.#changeDetector.markForCheck(); 
    });
  }

   addProperty() {
    this.newProperty.id = this.properties.length
  ? Math.max(...this.properties.map(p => p.id!)) + 1
  : 1;

    console.log(this.newProperty.id);

    this.properties.push(this.newProperty);
    this.filename = "";
    this.resetProperty();
   }

  deleteProperty(id: number | undefined) {
    this.properties = this.properties.filter(property => property.id !== id);
  }
}
