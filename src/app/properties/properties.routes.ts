import { Routes } from '@angular/router';
import { numericIdGuard } from '../shared/guards/numeric-id-guard';
import { leavePageGuard } from '../shared/guards/leave-page-guard';
import { loginActivateGuard } from '../shared/guards/login-activate-guard';

export const propertiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./properties-page/properties-page')
        .then(m => m.PropertiesPage),
    title: 'Properties',
  },
  {
    path: 'add',
    canActivate: [loginActivateGuard],
    loadComponent: () =>
      import('./property-form/property-form')
        .then(m => m.PropertyForm),
    canDeactivate: [leavePageGuard],
    title: 'New property',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./property-detail/property-detail')
        .then(m => m.PropertyDetail),
    canActivate: [numericIdGuard],
  },
  {
    path: 'edit/:id',
    canActivate: [loginActivateGuard, numericIdGuard], 
    loadComponent: () =>
      import('./property-form/property-form')
        .then(m => m.PropertyForm),
    canDeactivate: [leavePageGuard],
    title: 'Edit property',
  }
];
