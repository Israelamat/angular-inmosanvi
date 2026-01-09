import { Injectable, Signal, inject, linkedSignal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';

import { PropertiesResponse, Property, PropertyInsert, SinglePropertyResponse, SinglePropertyResponseInsert } from './../interfaces/propoerty';
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
    return httpResource<SinglePropertyResponseInsert>(() => {
      const propertyId = id();
      if (!propertyId) return undefined;
      return { url: `/properties/${propertyId}`, method: 'GET' };
    });
  }

  updateProperty(id: number, property: PropertyInsert): Observable<SinglePropertyResponse> {
  return this.#http.put<SinglePropertyResponse>(`/properties/${id}`, property);
}
}
