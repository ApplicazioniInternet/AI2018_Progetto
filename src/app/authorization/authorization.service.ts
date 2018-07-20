import { Injectable } from '@angular/core';
import { Router} from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import {MatSnackBar} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  constructor(private _router: Router, private _http: HttpClient,
              public jwtHelper: JwtHelperService, public snackBar: MatSnackBar) { }

  isAuthenticated(): boolean {
      const expireDate = localStorage.getItem('access_token_expire');
      if (expireDate !== null) {
          if (Number(expireDate) < new Date().valueOf()) {
              this.obtainRefreshToken();
          }
      }
      const token = this.jwtHelper.tokenGetter();
      return !this.jwtHelper.isTokenExpired(token);
  }

  obtainAccessToken(loginData) {
      const params = new HttpParams()
          .set('username', loginData.username)
          .set('password', loginData.password)
          .set('grant_type', 'password');

      const headersValue = new HttpHeaders()
          .append('Authorization', 'Basic ' + btoa('client:password'))
          .append('Content-type', 'application/x-www-form-urlencoded');

      const httpOptions = {
          headers: headersValue
      };

      this._http.post('http://localhost:8080/oauth/token', params.toString(), httpOptions)
          .subscribe(
              data => {
                  this.saveToken(data);
                  this.redirect();
              },
              err => {
                  this.openSnackBar('Login fallito', 'OK');
                  console.log(err);
              });
  }

  obtainRefreshToken() {
    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', localStorage.getItem('refresh_token'));

    const headersValue = new HttpHeaders()
        .append('Authorization', 'Basic ' + btoa('client:password'))
        .append('Content-type', 'application/x-www-form-urlencoded');

    const httpOptions = {
        headers: headersValue
    };

    this._http.post('http://localhost:8080/oauth/token', params.toString(), httpOptions)
        .subscribe(
            data => {
                this.saveToken(data);
                this.redirect();
            },
            err => {
                this.openSnackBar('Login fallito', 'OK');
                console.log(err);
            });
}

  saveToken(token) {
      let role;
      const expireDate = new Date().getTime() + (1000 * token.expires_in);

      switch (token.authorities) {
          case 'ROLE_USER':
              role = '/user';
              break;
          case 'ROLE_ADMIN':
              role = '/admin';
              break;
          case 'ROLE_CUSTOMER':
              role = '/customer';
              break;
          default:
              break;
      }

      localStorage.setItem('access_token', token.access_token);
      localStorage.setItem('access_role', role);
      localStorage.setItem('access_token_expire', expireDate.toString());
      localStorage.setItem('refresh_token', token.refresh_token);
  }

  roleGetter(): string {
      return localStorage.getItem('access_role');
  }

  logout(): void {
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_role');
  }

  openSnackBar(message: string, action: string) {
      this.snackBar.open(message, action, {
          duration: 2000,
      });
  }

  isAuthorized(uri: string) {
    return uri === this.roleGetter();
  }

  redirect() {
    const commands = [];
    commands.push(this.roleGetter());
    this._router.navigate(commands);
  }
}
