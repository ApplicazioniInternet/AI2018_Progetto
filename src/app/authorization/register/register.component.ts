import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {AuthorizationService} from '../authorization.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  toolbarTitle = 'Register';
  hide = true;
  requiredUsernameFormControl = new FormControl('', [Validators.required]);
  requiredPasswordFormControl = new FormControl('', [Validators.required]);
  requiredPasswordConfirmFormControl = new FormControl('', [Validators.required]);
  public loginData = {username: '', password: '', passwordConfirm: ''};
  constructor(private authService: AuthorizationService, private router: Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.redirect();
    }
  }

  register(): void {
    if (this.requiredPasswordFormControl.invalid || this.requiredUsernameFormControl.invalid) {
      this.openSnackBar('Devi completate tutti i campi', 'OK');
    } else {
      this.loginData.username = this.requiredUsernameFormControl.value;
      this.loginData.password = this.requiredPasswordFormControl.value;
      this.loginData.passwordConfirm = this.requiredPasswordConfirmFormControl.value;
      this.authService.register(this.loginData);
    }
  }

  getErrorMessageUsername(): string {
    return this.requiredUsernameFormControl.hasError('required') ? 'Devi inserire uno username' : '';
  }

  getErrorMessagePassword(): string {
    return this.requiredPasswordFormControl.hasError('required') ? 'Devi inserire una password' : '';
  }

  getErrorMessagePasswordConfirm(): string {
    return this.requiredPasswordConfirmFormControl.hasError('required') ? 'Devi inserire una password' : '';
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
