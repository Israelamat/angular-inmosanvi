import { computed, inject, Injectable, PLATFORM_ID, Signal, signal, WritableSignal } from '@angular/core';
import { LoginData, MyUser, MyUserResponse, RegisterData, RegisterStringReponse, TokenResponse, UserResponse } from '../interfaces/auth';
import { HttpClient, httpResource } from '@angular/common/http';
import { catchError, map, Observable, of, tap, finalize } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

@Injectable({ providedIn: 'root' })
export class AuthService {

  #http = inject(HttpClient);
  #platformId = inject(PLATFORM_ID);
  #isBrowser = isPlatformBrowser(this.#platformId);
  #router = inject(Router);
  #cookieService = inject(SsrCookieService);

  #logged: WritableSignal<boolean> = signal(false);
  get logged(): Signal<boolean> { return this.#logged.asReadonly(); }

  #myUser = signal<MyUser | null>(null);
  get myUser(): Signal<MyUser | null> { return this.#myUser.asReadonly(); }

  #token = signal<string | null>(null);
  #validateInFlight: Observable<boolean> | null = null;

  user = computed(() => this.#myUser());
  userId = computed(() => this.#myUser()?.id);

  constructor() {
    const t = this.#cookieService.get('token');
    if (t) this.#token.set(t);
  }

  register(user: RegisterData): Observable<RegisterStringReponse> {
    return this.#http.post<RegisterData>('/auth/register', user);
  }

  private setTokenAndLogged(token: string) {
    this.#token.set(token);
    this.#logged.set(true);

    if (this.#isBrowser) {
      this.#cookieService.set('token', token, {
        path: '/',
        secure: false,
        sameSite: 'Lax',
      });
    };
  }

  login(user: LoginData): Observable<TokenResponse> {
    return this.#http.post<TokenResponse>('/auth/login', user).pipe(
      tap(res => this.setTokenAndLogged(res.accessToken))
    );
  }

  loginWithGoogle(data: { token: string }): Observable<TokenResponse> {
    return this.#http.post<{ accessToken: string }>('/auth/google', data).pipe(
      tap(res => this.setTokenAndLogged(res.accessToken))
    );
  }

  loginWithFacebook(data: { token: string }): Observable<TokenResponse> {
    return this.#http.post<{ accessToken: string }>('/auth/facebook', data).pipe(
      tap(res => this.setTokenAndLogged(res.accessToken))
    );
  }

  logout(): void {
    this.#cookieService.delete('token');
    this.#myUser.set(null);
    this.#token.set(null);
    this.#logged.set(false);

    if (this.#isBrowser) {
      this.#router.navigate(['/auth/login']);
    }

    const googleAccounts = (window as any).google?.accounts?.id;
    if (googleAccounts) googleAccounts.disableAutoSelect();
  }

  isLogged(): Observable<boolean> {
    const token = this.#token();

    if (!token) return of(false);

    if (this.#logged()) return of(true);

    if (this.#validateInFlight) return this.#validateInFlight; // avoid duplicate requests

    const validate = this.#http.get('/auth/validate').pipe(
      tap(() => this.#logged.set(true)),
      map(() => true),
      catchError(() => {
        this.#logged.set(false);
        localStorage.removeItem('token');
        return of(false);
      }),
      finalize(() => { this.#validateInFlight = null; })
    );

    this.#validateInFlight = validate;
    return validate;
  }

  getMe(): Observable<MyUser | null> {
    return this.#http.get<MyUserResponse>('/users/me').pipe(
      map(res => res.user),
      tap(user => {
        this.#myUser.set(user);
        this.#logged.set(true);
      }),
      catchError(err => {
        //avoid unexpected unauthorized errors
        this.#myUser.set(null);
        this.#logged.set(false);
        return of(null);
      })
    );
  }
}
