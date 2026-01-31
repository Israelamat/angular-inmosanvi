import { CanDeactivateFn } from '@angular/router';
import { PropertyForm } from '../../properties/property-form/property-form';

export const leavePageGuard: CanDeactivateFn<PropertyForm> = (component) => {
  if (component.propertyCreated()) {
    return true;
  }

  const isDirty = !component.pristine();
  if (isDirty) {
    return confirm('You have unsaved changes. Do you really want to leave?');
  }
  return true;
};
