import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { baseUrlInterceptor } from './shared/interceptors/base-url-interceptor-interceptor';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideSignalFormsConfig, SignalFormsConfig } from '@angular/forms/signals';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideSweetAlert2 } from '@sweetalert2/ngx-sweetalert2';
import { provideGoogleId } from './google-login/google-login.config';

export const NG_STATUS_CLASSES: SignalFormsConfig['classes'] = {
  'is-valid': field => field.state().valid(),   // <-- Llamamos al signal
  'is-invalid': field => field.state().invalid(),
  'ng-touched': field => field.state().touched(),
  'ng-untouched': field => !field.state().touched(),
  'ng-dirty': field => field.state().dirty(),
  'ng-pristine': field => !field.state().dirty(),
  'ng-pending': field => field.state().pending(),

};


export const appConfig: ApplicationConfig = {
  providers: [
    provideSweetAlert2({ fireOnInit: false, dismissOnDestroy: true, }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([baseUrlInterceptor])),
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES,
    }),
    provideClientHydration(withEventReplay()),
    provideGoogleId('346010978808-3729g5sdok53b39ai2do3g366smlia2u.apps.googleusercontent.com')
  ]
};
