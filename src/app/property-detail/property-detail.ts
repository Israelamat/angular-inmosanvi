import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertiesService } from '../services/properties-service';
import { Property } from '../interfaces/propoerty';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-detail',
  imports: [FormsModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class PropertyDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertiesService = inject(PropertiesService);

  property = signal<Property>({
    id: 0,
    title: 'Property not found',
    description: 'No property data available',
    price: 0,
    address: 'Unknown',
    sqmeters: 0,
    numRooms: 0,
    numBaths: 0,
    mainPhoto: '',
    status: 'error',
    createdAt: new Date().toISOString(),
    town: null
  });

  downPayment = signal(0);
  loanTerm = signal(30);
  interestRate = signal(3.5);
  monthlyPayment = signal<string | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/properties']);
      return;
    }

    const resource = this.propertiesService.getPropertyResource(signal(id));

    effect(() => {
      const data = resource.value();
      if (data) this.property.set(data.property);
    });

    resource.reload(); // fuerza la petición HTTP
  }

  calculateMortgage() {
    const prop = this.property();
    if (!prop) return;

    const principal = prop.price - this.downPayment();
    const totalPayments = this.loanTerm() * 12;
    const monthlyRate = this.interestRate() / 100 / 12;

    if (principal <= 0 || totalPayments <= 0 || monthlyRate < 0) {
      this.monthlyPayment.set("Please enter valid values.");
      return;
    }

    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    this.monthlyPayment.set(`${payment.toFixed(2)} €`);
  }
}
