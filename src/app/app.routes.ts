import { Routes } from '@angular/router';
import { logoutActivateGuard } from './shared/guards/logout-activate-guard';
import { loginActivateGuard } from './shared/guards/login-activate-guard';


export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [logoutActivateGuard],
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'properties',
    loadChildren: () =>
      import('./properties/properties.routes').then(m => m.propertiesRoutes),
  },
  {
    path: 'profile',
    canMatch: [loginActivateGuard],
    loadChildren: () =>
      import('./profile/profile.routes').then(m => m.profileRoutes),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];

