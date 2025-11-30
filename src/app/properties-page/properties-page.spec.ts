import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesPage } from './properties-page';

describe('PropertiesPage', () => {
  let component: PropertiesPage;
  let fixture: ComponentFixture<PropertiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
