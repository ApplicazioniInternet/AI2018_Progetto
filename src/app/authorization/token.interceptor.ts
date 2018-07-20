import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import {Observable} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public jwtHelper: JwtHelperService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    	const token = this.jwtHelper.tokenGetter();

      if (request.url !== 'http://localhost:8080/oauth/token' && token !== null) {
        if (request.method.toLocaleLowerCase() === 'post') {
          request = request.clone({
          setHeaders: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            }
          });
        } else {
          request = request.clone({
            setHeaders: {
              'Authorization': 'Bearer ' + token
            }
          });
        }
      }

      return next.handle(request);
    }
}
