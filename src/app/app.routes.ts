import { Routes } from '@angular/router';
import { PropertiesPage } from './properties-page/properties-page';
import { PropertyForm } from './property-form/property-form';
import { PropertyDetail } from './property-detail/property-detail';
import { LoginPage } from './login-page/login-page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },

  {
    path: 'properties',
    children: [
      { path: '', component: PropertiesPage },
      { path: 'add', component: PropertyForm },
      { path: ':id', component: PropertyDetail },
    ],
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
