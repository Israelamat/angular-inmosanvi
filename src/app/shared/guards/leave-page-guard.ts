import { CanDeactivateFn } from '@angular/router';
import { PropertyForm } from '../../properties/property-form/property-form';

export const leavePageGuard: CanDeactivateFn<PropertyForm> = (component) => {
  if (component.propertyCreated()) {
    return true;
  }

  return confirm('You have not saved the property. Do you want to leave?');
};
