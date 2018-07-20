import { Component, OnInit } from '@angular/core';
import {ClientHttpService} from '../client-http.service';
import {Position} from '../position';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    toolbarTitle = 'User';
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
