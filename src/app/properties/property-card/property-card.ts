import { ChangeDetectionStrategy, Component, input, Input, output, Signal, signal } from '@angular/core';
import { Property } from '../../interfaces/propoerty';
import { IntlCurrencyPipe } from "../../pipes/intl-currency-pipe";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-property-card',
  imports: [IntlCurrencyPipe, RouterLink],
  templateUrl: './property-card.html',
  styleUrl: './property-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grow flex items-center justify-center',
  }
})
export class PropertyCard {
  property = input.required<Property>();
  canDelete = input(false); 
  canEdit = input(false); 
  deleted = output<number>();


  deleteProperty() {
    this.deleted.emit(this.property().id);
  }
}
