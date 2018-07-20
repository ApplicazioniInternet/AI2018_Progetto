import {Component, Input, OnInit} from '@angular/core';
import {AuthorizationService} from '../../authorization/authorization.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  private _toolbarTitle: string;
  loggedIn: boolean;

  constructor(private authService: AuthorizationService) { }

  ngOnInit() {
    this.loggedIn = this.authService.isAuthenticated();
  }

  @Input()
  set toolbarTitle(value: string) {
      this._toolbarTitle = value;
  }

  logout() {
    this.authService.logout();
  }
}
