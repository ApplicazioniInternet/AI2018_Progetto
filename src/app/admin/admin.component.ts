import { Component, OnInit } from '@angular/core';
import {ClientHttpService} from '../client-http.service';
import {User} from '../user';
import {Position} from '../position';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  toolbarTitle = 'Admin';
  positions: Position[];
  users: User[];
  displayedColumns = ['id', 'username', 'role'];
  constructor( private client: ClientHttpService) { }

  ngOnInit() {
    this.client.getPositions().subscribe(
        data => this.positions = data
    );
    this.client.getUsers().subscribe(
        data => this.users = data
    );
  }

  getUsersPositions(id: number) {
      this.client.getUsersPositions(id).subscribe(
          data => this.positions = data
      );
  }

  getDate(timestamp: number): string {
      return new Date(timestamp).toLocaleString();
  }
}
