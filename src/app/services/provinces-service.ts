import { Injectable, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { ProvincesResponse, TownsResponse } from '../interfaces/propoerty';
@Injectable({
  providedIn: 'root',
})
export class ProvincesService {


  readonly provincesResource = httpResource<ProvincesResponse>(
    () => ({
      url: '/provinces',
      method: 'GET'
    }),
    { defaultValue: { provinces: [] } }
  );

  getTownsResource(provinceId: Signal<number>) {
    return httpResource<TownsResponse>(
      () => {
        const id = provinceId();
        if (!id) return undefined;

        return {
          url: `provinces/${id}/towns`,
          method: 'GET'
        };
      },
      { defaultValue: { towns: [] } }
    );
  }
}
