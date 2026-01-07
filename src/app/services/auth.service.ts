import { inject, Injectable } from '@angular/core';
import { LoginData, RegisterData, RegisterStringReponse, TokenResponse } from '../interfaces/auth';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #http = inject(HttpClient)

  register(user: RegisterData): Observable<RegisterStringReponse> {
    return this.#http.post<RegisterData>('/auth/register', user);
  }

  login(user: LoginData): Observable<TokenResponse> {
    return this.#http.post<TokenResponse>('/auth/login', user);
  }

   loginWithGoogle(data: { token: string }) {
    return this.#http.post<{ token: string }>('/api/auth/google', data)
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
        })
      );
  }
}
