import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { FormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';

import { ReactiveFormsModule } from '@angular/forms';
import { CustomerComponent } from './customer/customer.component';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './authorization/login/login.component';

import { RouterModule, Routes } from '@angular/router';
import { DialogOverviewComponent } from './shared-components/dialog-overview/dialog-overview.component';
import { ToolbarComponent } from './shared-components/toolbar/toolbar.component';
import { UpdateFileComponent } from './shared-components/update-file/update-file.component';
import { AuthGuardService } from './authorization/auth-guard.service';
import {TokenInterceptor} from './authorization/token.interceptor';

const appRoutes: Routes = [
    { path: 'user', component: UserComponent, canActivate: [AuthGuardService] },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuardService] },
    { path: 'customer', component: CustomerComponent, canActivate: [AuthGuardService] },
    { path: '**', component: LoginComponent }
];

export function tokenGetter() {
    return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    DialogOverviewComponent,
    CustomerComponent,
    AdminComponent,
    UserComponent,
    LoginComponent,
    DialogOverviewComponent,
    ToolbarComponent,
    UpdateFileComponent,
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
  entryComponents: [DialogOverviewComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
