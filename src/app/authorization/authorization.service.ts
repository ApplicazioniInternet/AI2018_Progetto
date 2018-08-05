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

  register(loginData) {
    const params = new HttpParams()
      .set('username', loginData.username)
      .set('password', loginData.password)
      .set('passwordConfirm', loginData.passwordConfirm);

    const headersValue = new HttpHeaders()
      .append('Content-type', 'application/x-www-form-urlencoded');

    const httpOptions = {
      headers: headersValue
    };

    this._http.post('http://localhost:8080/register', params.toString(), httpOptions)
      .subscribe(
        () => {
          this.obtainAccessToken(loginData);
        },
        err => {
          this.openSnackBar(err.error.message, 'OK');
        });
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
            () => {
                  this.openSnackBar('Login fallito', 'OK');
              });
  }

  obtainRefreshToken() {

    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', localStorage.getItem('refresh_token'));

    localStorage.clear();

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
              this.openSnackBar('Sessione scaduta', 'OK');
            },
          () => {
              this.openSnackBar('Impossibile recuperare la sessione', 'OK');
            });
  }

  saveToken(token) {
      const expireDate = new Date().getTime() + (1000 * token.expires_in);

      localStorage.setItem('uid', token.uid);
      localStorage.setItem('access_token', token.access_token);
      localStorage.setItem('access_token_expire', expireDate.toString());
      localStorage.setItem('refresh_token', token.refresh_token);
  }


  logout(): void {
      localStorage.removeItem('access_token');
      localStorage.removeItem('uid');
  }

  openSnackBar(message: string, action: string) {
      this.snackBar.open(message, action, {
          duration: 2000,
      });
  }

  redirect() {
    this._router.navigate(['/manage']);
  }

}
