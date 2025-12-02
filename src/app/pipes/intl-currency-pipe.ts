import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intlCurrency',
})
export class IntlCurrencyPipe implements PipeTransform {

  transform(value: number,
    currency: string,
    language: string,
    maximumFractionDigits: number = 0): string {
      if( value == null ) return '';
      const foamatter =  new Intl.NumberFormat(language, {
        style: "currency",
        currency,
        maximumFractionDigits
      });
      return foamatter.format(value);
  }

}
