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
import { DialogOverviewComponent } from './shared-components/dialog-overview/dialog-overview.component';
import { UpdateFileComponent } from './shared-components/update-file/update-file.component';
import { AuthGuardService } from './authorization/auth-guard.service';
import { TokenInterceptor } from './authorization/token.interceptor';
import { RegisterComponent } from './authorization/register/register.component';
import { ManageComponent } from './user/manage/manage.component';
import { GraphComponent } from './user/buy/graph/graph.component';

import { jqxChartComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxchart';
import { jqxDropDownListComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdropdownlist';

const appRoutes: Routes = [
    { path: 'manage', component: ManageComponent, canActivate: [AuthGuardService] },
    { path: 'buy', component: BuyComponent, canActivate: [AuthGuardService] },
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
    DialogOverviewComponent,
    BuyComponent,
    LoginComponent,
    DialogOverviewComponent,
    UpdateFileComponent,
    RegisterComponent,
    ManageComponent,
    GraphComponent,
    jqxChartComponent,
    jqxDropDownListComponent
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
