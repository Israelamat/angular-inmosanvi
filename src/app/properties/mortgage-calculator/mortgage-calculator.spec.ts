import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MortgageCalculator } from './mortgage-calculator';

describe('MortgageCalculator', () => {
  let component: MortgageCalculator;
  let fixture: ComponentFixture<MortgageCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MortgageCalculator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MortgageCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
