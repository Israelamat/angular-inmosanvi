import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs';

export const loginActivateGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLogged().pipe(
    take(1), 
    map(isLogged => {
      console.log('GUARD isLogged', isLogged);

      if (isLogged) return true;

      return router.createUrlTree(['/auth/login']);
    })
  );
};
//When the routes are not lazyloading we can use this

// export const loginActivateGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   return authService.isLogged().pipe(
//     map(isLogged => {
//       if (!isLogged) {
//         return router.createUrlTree(['/auth/login']);
//       }
//       return true;
//     })
//   );
// };
