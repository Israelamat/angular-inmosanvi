import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Property } from '../interfaces/propoerty';
import { IntlCurrencyPipe } from "../pipes/intl-currency-pipe";

@Component({
  selector: 'app-property-card',
  imports: [IntlCurrencyPipe],
  templateUrl: './property-card.html',
  styleUrl: './property-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyCard {
  @Input({ required: true }) property!: Property;
  propertySignal = signal<Property | null>(null);
  @Output() deleted = new EventEmitter<number>();

  ngOninit() {
    this.propertySignal.set(this.property);
  }

  deleteProperty() {
    this.deleted.emit(this.property.id);
  }
}
