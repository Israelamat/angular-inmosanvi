import { Routes } from '@angular/router';
import { PropertiesPage } from './properties-page/properties-page';
import { PropertyForm } from './property-form/property-form';
import { PropertyDetail } from './property-detail/property-detail';
import { LoginPage } from './login-page/login-page';
import { numericIdGuard } from './guards/numeric-id-guard';
import { leavePageGuard } from './guards/leave-page-guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },

  {
    path: 'properties',
    children: [
      { path: '', component: PropertiesPage },
      { path: 'add', component: PropertyForm, canDeactivate: [leavePageGuard] },
      { path: ':id', component: PropertyDetail, canActivate: [numericIdGuard] },
    ],
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
