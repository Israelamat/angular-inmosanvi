import { Routes } from '@angular/router';
import { loginActivateGuard } from '../shared/guards/login-activate-guard';

export const profileRoutes: Routes = [
  {
    path: '', 
    loadComponent: () =>
      import('./profile-page/profile-page').then(m => m.ProfilePage),
    title: 'Profile',
    canMatch: [loginActivateGuard],
  },
  {
    path: ':id', 
    loadComponent: () =>
      import('./profile-page/profile-page').then(m => m.ProfilePage),
    title: 'Profile',
  },
];
