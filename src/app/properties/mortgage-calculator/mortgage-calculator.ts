import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-mortgage-calculator',
  imports: [],
  templateUrl: './mortgage-calculator.html',
  styleUrl: './mortgage-calculator.css',
})
export class MortgageCalculator {
  @Input() price: number | undefined; //do not need reactivity 

  downPayment = signal(0);
  loanTerm = signal(30);
  interestRate = signal(3.5);
  monthlyPayment = signal<string | null>(null);

  calculate() {
    const p = (this.price ?? 0) - this.downPayment();
    const totalPayments = this.loanTerm() * 12;
    const monthlyRate = this.interestRate() / 100 / 12;

    if (p <= 0 || totalPayments <= 0 || monthlyRate <= 0) {
      this.monthlyPayment.set('Please enter valid values.');
      return;
    }

    const payment =
      p *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    this.monthlyPayment.set(`${payment.toFixed(2)} €`);
  }
}
