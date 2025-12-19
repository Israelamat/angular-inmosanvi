import { Injectable, inject, linkedSignal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';

import { PropertiesResponse, Property, PropertyInsert, SinglePropertyResponse } from './../interfaces/propoerty';
import { map, Observable } from 'rxjs';

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
    return this.#http.post<SinglePropertyResponse>('/properties', property);
  }

  deleteProperty(id: number): Observable<void> {
    return this.#http.delete<void>(`/properties/${id}`);
  }
}
