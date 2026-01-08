import { inject, Injectable, PLATFORM_ID, Signal, signal, WritableSignal } from '@angular/core';
import { LoginData, MyUser, MyUserResponse, RegisterData, RegisterStringReponse, TokenResponse } from '../interfaces/auth';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #http = inject(HttpClient);
  #platformId = inject(PLATFORM_ID);
  #isBrowser = isPlatformBrowser(this.#platformId);
  #router = inject(Router);
  #cookieService = inject(SsrCookieService);

  #logged: WritableSignal<boolean> = signal(false);
  get logged(): Signal<boolean> {
    return this.#logged.asReadonly();
  }

  #myUser = signal<MyUser | null>(null);
  get myUser(): Signal<MyUser | null> {
    return this.#myUser.asReadonly();
  }


  register(user: RegisterData): Observable<RegisterStringReponse> {
    return this.#http.post<RegisterData>('/auth/register', user);
  }

  login(user: LoginData): Observable<TokenResponse> {
    return this.#http.post<TokenResponse>('/auth/login', user).pipe(
      tap(res => {
        this.#cookieService.set('token', res.accessToken);
        this.#logged.set(true);
      })
    );
  }


  loginWithGoogle(data: { token: string }) {
    return this.#http.post<{ token: string }>('/auth/google', data)
      .pipe(
        tap(res => {
          this.#cookieService.set('token', res.token);
          this.#logged.set(true);
        })
      );
  }

  loginWithFacebook(data: { token: string }) {
    //TO DO
  }

  logout(): void {
    this.#cookieService.delete('token');
    this.#cookieService.delete('user'); // opcional, si guardas info usuario
    this.#logged.set(false);
    this.#myUser.set(null);


    if (this.#isBrowser) {
      // solo navegar en el navegador, no en el server
      this.#router.navigate(['/auth/login']);
    }

    const googleAccounts = (window as any).google?.accounts?.id;
    if (googleAccounts) {
      googleAccounts.disableAutoSelect(); // evita que Google auto-login
    }
  }


  isLogged(): Observable<boolean> {
    const token = this.#cookieService.get('token');

    console.log('COOKIE TOKEN:', token);
    console.log('SIGNAL LOGGED:', this.#logged());

    if (!token) {
      return of(false);
    }

    if (this.#logged()) {
      return of(true);
    }

    return this.#http.get('/auth/validate').pipe(
      tap(() => this.#logged.set(true)),
      map(() => true),
      catchError(() => of(false))
    );
  }


  getMe(): Observable<MyUser> {
    return this.#http.get<MyUserResponse>('/users/me').pipe(
      map(res => res.user),
      tap(user => {
        this.#myUser.set(user);
        this.#logged.set(true);
      })
    );
  }
}
