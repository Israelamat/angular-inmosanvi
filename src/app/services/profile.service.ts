import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { MyUserResponse, User, UserResponse } from '../interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  #http = inject(HttpClient);

  getMe() {
    return this.#http.get<MyUserResponse>('/users/me');
  }

  getById(id: number) {
    return this.#http.get<UserResponse>(`/users/${id}`);
  }

  getProfileResource(user: Signal<User | null>) {
    return httpResource<UserResponse | undefined>(() => {
      const userId = user()?.id;
      if (!userId) return undefined;

      return { url: `/users/${userId}`, method: 'GET' };
    });
  }
}
