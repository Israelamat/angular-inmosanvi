import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyComments } from './property-comments';

describe('PropertyComments', () => {
  let component: PropertyComments;
  let fixture: ComponentFixture<PropertyComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyComments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
