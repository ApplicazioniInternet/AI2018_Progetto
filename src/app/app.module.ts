import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';

import { ReactiveFormsModule } from '@angular/forms';
import { BuyComponent } from './user/buy/buy.component';
import { LoginComponent } from './authorization/login/login.component';

import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './authorization/auth-guard.service';
import { TokenInterceptor } from './authorization/token.interceptor';
import { RegisterComponent } from './authorization/register/register.component';
import { ManageComponent } from './user/manage/manage.component';
import { CheckoutComponent } from './user/checkout/checkout.component';

const appRoutes: Routes = [
    { path: 'manage', component: ManageComponent, canActivate: [AuthGuardService] },
    { path: 'buy', component: BuyComponent, canActivate: [AuthGuardService] },
    { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuardService] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: LoginComponent }
];

export function tokenGetter() {
    return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    BuyComponent,
    LoginComponent,
    RegisterComponent,
    ManageComponent,
    CheckoutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    LeafletModule.forRoot(),
    LeafletModule,
    HttpClientModule,
    JwtModule.forRoot({
        config: {
            tokenGetter: tokenGetter,
            whitelistedDomains: ['localhost:8080'],
            blacklistedRoutes: ['localhost:8080/oauth/']
        }
    }),
    FormsModule,
    LeafletDrawModule.forRoot(),
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
      {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
