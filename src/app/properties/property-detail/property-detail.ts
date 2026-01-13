import { ChangeDetectionStrategy, Component, computed, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { PropertiesService } from '../../services/properties-service';
import { Property } from '../../interfaces/propoerty';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MortgageCalculator } from '../mortgage-calculator/mortgage-calculator';
import { PropertyComments } from '../property-comments/property-comments';
import { StarRating } from '../../shared/star-rating/star-rating';
import { OlMap } from '../../ol-maps/ol-map';
import { OlMarker } from '../../ol-maps/ol-marker';

@Component({
  selector: 'app-property-detail',
  imports: [FormsModule, MortgageCalculator, PropertyComments, OlMap, OlMarker],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDetail {
  id = input.required({ transform: numberAttribute });

  private propertiesService = inject(PropertiesService);
  private titleService = inject(Title);

  propertyResource = this.propertiesService.getPropertyResource(this.id);
  property = computed(() => this.propertyResource.value()?.property);

  coordinates = signal<[number, number]>([-0.5, 38.5]);
  downPayment = signal(0);
  loanTerm = signal(30);
  interestRate = signal(3.5);
  monthlyPayment = signal<string | null>(null);

  constructor() {
    effect(() => {
      const prop = this.property();
      if (prop) {
        this.titleService.setTitle(prop.title);

        if (prop.town) {
          this.coordinates.set([
            parseFloat(prop.town.longitude),
            parseFloat(prop.town.latitude)
          ]);
        }
      }
    });
  }

  calculateMortgage() {
    const prop = this.property();
    if (!prop) return;

    const principal = prop.price - this.downPayment();
    const totalPayments = this.loanTerm() * 12;
    const monthlyRate = this.interestRate() / 100 / 12;

    if (principal <= 0 || totalPayments <= 0 || monthlyRate <= 0) {
      this.monthlyPayment.set('Please enter valid values.');
      return;
    }

    const payment =
      principal *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    this.monthlyPayment.set(`${payment.toFixed(2)} €`);
  }
}
