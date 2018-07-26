import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Position} from '../../position';
import {ClientHttpService} from '../../client-http.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  title = 'Manage';
  textareaForm = new FormControl();
  positions: Position[];
  constructor(private client: ClientHttpService, private snackBar: MatSnackBar ) { }

  ngOnInit() {
    this.getPositions();
  }

  getDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  submit() {
    this.client.uploadPositions(this.textareaForm.value).subscribe(
      ()  => {
        this.openSnackBar('Caricamento riuscito', 'OK');
        this.textareaForm.reset();
        this.getPositions();
      },
      err  => {
        if (err.status === 406) {
          this.openSnackBar( err.error.message, 'OK');
        } else if (err.status === 400) {
          this.openSnackBar( 'Dati incorretti inseriti', 'OK');
        } else {
          this.openSnackBar( 'Errore caricamento posizione', 'OK');
        }
      }
    );
  }

  getPositions() {
    this.client.getUserPositions().subscribe(
      data => this.positions = data
    );
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
