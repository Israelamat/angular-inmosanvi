import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs';

export const loginActivateGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLogged().pipe(
    take(1), // solo toma el primer valor
    map(isLogged => {
      console.log('GUARD isLogged', isLogged);

      if (isLogged) return true;

      // si no está logueado, redirige
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
