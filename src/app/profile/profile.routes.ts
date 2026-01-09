import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '', 
    loadComponent: () =>
      import('./profile-page/profile-page').then(m => m.ProfilePage),
    title: 'Profile',
  },
  {
    path: ':id', 
    loadComponent: () =>
      import('./profile-page/profile-page').then(m => m.ProfilePage),
    title: 'Profile',
  },
];
