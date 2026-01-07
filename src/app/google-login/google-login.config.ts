import { InjectionToken, Provider } from '@angular/core';

export const CLIENT_ID = new InjectionToken<string>('346010978808-3729g5sdok53b39ai2do3g366smlia2u.apps.googleusercontent.com');

export function provideGoogleId(clientId: string): Provider {
  return { provide: CLIENT_ID, useValue: clientId };
}