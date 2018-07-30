import { Component, OnInit } from '@angular/core';
import {AuthorizationService} from '../authorization.service';
import {Router} from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  requiredUsernameFormControl = new FormControl('', [Validators.required]);
  requiredPasswordFormControl = new FormControl('', [Validators.required]);
  public loginData = {username: '', password: ''};
  constructor(private authService: AuthorizationService, private router: Router, public snackBar: MatSnackBar) {}

  ngOnInit () {
    if (this.authService.isAuthenticated()) {
        this.authService.redirect();
    }
  }

  login(): void {
      if (this.requiredPasswordFormControl.invalid || this.requiredUsernameFormControl.invalid) {
        this.openSnackBar('Devi completate tutti i campi', 'OK');
      } else {
        this.loginData.username = this.requiredUsernameFormControl.value;
        this.loginData.password = this.requiredPasswordFormControl.value;
        this.authService.obtainAccessToken(this.loginData);
      }
  }

  getErrorMessageUsername(): string {
    return this.requiredUsernameFormControl.hasError('required') ? 'Devi inserire uno username' : '';
  }

  getErrorMessagePassword(): string {
    return this.requiredPasswordFormControl.hasError('required') ? 'Devi inserire una password' : '';
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
