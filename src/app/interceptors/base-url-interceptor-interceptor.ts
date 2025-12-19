import { HttpInterceptorFn } from '@angular/common/http';
import { isDevMode } from '@angular/core';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const serverUrl = isDevMode() ? 'http://localhost:3000' : 'https://miservidor.com/api-products';
    const url = req.url.startsWith('/') ? req.url.slice(1) : req.url;
  
  const reqClone = req.clone({
    url: `${serverUrl}/${url}`,
  });
  return next(reqClone);
};
