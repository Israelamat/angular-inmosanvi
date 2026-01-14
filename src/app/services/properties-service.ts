import { Injectable, Signal, computed, inject, linkedSignal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';

import { PropertiesResponse, Property, PropertyInsert, RatingsResponse, SinglePropertyResponse, SinglePropertyResponseInsert } from './../interfaces/propoerty';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class PropertiesService {

  #http = inject(HttpClient);

  readonly propertiesResource = httpResource<PropertiesResponse>(
    () => ({
      url: '/properties',
      method: 'GET'
    }),
    { defaultValue: { properties: [] } }
  );

  readonly properties = linkedSignal(
    () => this.propertiesResource.value()?.properties ?? []
  );

  getPropertiesResource(
    search: Signal<string>,
    provinceId: Signal<number>,
    page: Signal<number>,
    sellerId: Signal<number | null>
  ) {
    return httpResource<PropertiesResponse>(() => {
      const sellerValue = sellerId();
      const params = new URLSearchParams();
      if (search()) params.set('search', search());
      if (provinceId() !== 0) params.set('provinceId', provinceId().toString());
      if ( sellerValue!= null) params.set('seller', sellerValue.toString());
      params.set('page', page().toString());
      const url = `/properties?${params.toString()}`;
      console.log('Resource URL:', url);
      return url;
    });
  }

  addProperty(property: PropertyInsert): Observable<SinglePropertyResponse> {
    return this.#http
      .post<SinglePropertyResponse>('/properties', property)
      .pipe(
        tap(() => {
          this.propertiesResource.reload();
        })
      );
  }

  deleteProperty(id: number): Observable<void> {
    return this.#http
      .delete<void>(`/properties/${id}`)
      .pipe(
        tap(() => {
          this.propertiesResource.reload();
        })
      );
  }

  getPropertyResource(id: Signal<number | undefined>) {
    return httpResource<SinglePropertyResponse>(() => {
      const propertyId = id();
      if (!propertyId) return undefined;
      return { url: `/properties/${propertyId}`, method: 'GET' };
    });
  }

  updateProperty(id: number, property: PropertyInsert): Observable<SinglePropertyResponse> {
    return this.#http.put<SinglePropertyResponse>(`/properties/${id}`, property);
  }

  getPropertiesSearchResource(search: Signal<string>) {
    const queryParams = computed(() => new URLSearchParams({ search: search() }));
    return httpResource<PropertiesResponse>(() => `properties?${queryParams()}`);
  }

  getPropertyRatings(id: number): Observable<RatingsResponse> {
    return this.#http.get<RatingsResponse>(`/properties/${id}/ratings`).pipe(
      catchError(err => {
        Swal.fire('Error', 'Could not get property ratings', 'error');
        return throwError(() => err);
      }
      )
    );
  }

  addPropertyRating(rating: { property: number; rating: number; comment: string }) {
    return this.#http.post(`/properties/${rating.property}/ratings`, rating).pipe(
      catchError(err => {
        const message = err?.error?.message || 'Could not add property rating';
        Swal.fire('Error', message, 'error');
        return throwError(() => err);
      }
      )
    );
  }
}
