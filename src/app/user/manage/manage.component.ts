import {Component, ElementRef, OnInit} from '@angular/core';
import { ViewChild } from '@angular/core';
import {ClientHttpService} from '../../client-http.service';
import {MatSnackBar} from '@angular/material';
import {Archive} from '../../archive';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  title = 'Manage';
  archives: Archive[];
  archivesBought: Archive[];
  saleCount: number;
  filename = 'Nessun file scelto';
  invalidfile = true;

  @ViewChild('inputFile')
  file: ElementRef;

  constructor(private client: ClientHttpService,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getArchives();
    this.getArchivesBought();
  }

  fileChanged() {
    if (this.file.nativeElement.files[0] !== null) {
      if (this.file.nativeElement.files[0].type === 'application/json') {
        this.filename = this.file.nativeElement.files[0].name;
        this.invalidfile = false;
      } else {
        this.openSnackBar( 'Inserire un file in formato json', 'OK');
      }
    }
  }

  getDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  submit() {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.client.uploadArchives(fileReader.result).subscribe(
          ()  => {
            this.openSnackBar('Caricamento riuscito', 'OK');
            this.reset();
            this.getArchives();
          },
          err  => {
            if (err.status === 400) {
              this.openSnackBar( err.error.message, 'OK');
            } else {
              this.openSnackBar( 'Errore caricamento posizione', 'OK');
            }
          }
        );
    };
    fileReader.readAsText(this.file.nativeElement.files[0]);
  }

  reset() {
    this.file.nativeElement.value = '';
    this.filename = 'Nessun file scelto';
    this.invalidfile = true;
  }


  downloadArchive(id: string, filename: string) {
    this.client.downloadArchive(id).subscribe(
      (data)  => {
        const theJSON = JSON.stringify(data);
        const downloadJsonHref = 'data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', downloadJsonHref);
        downloadAnchorNode.setAttribute('download', filename + '.json');
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        this.openSnackBar('Download riuscito', 'OK');
      },
      ()  => {
        this.openSnackBar( 'Errore durante il download dell\'archivio', 'OK');
      }
    );
  }

  deleteArchive(id: string) {
    this.client.deleteArchive(id).subscribe(
      ()  => {
        this.openSnackBar('Eliminazione riuscita', 'OK');
        this.getArchives();
      },
      ()  => {
        this.openSnackBar( 'Errore durante l\'eliminazione dell\'archivio', 'OK');
      }
    );
  }

  getArchives() {
    const id = localStorage.getItem('uid');
    this.client.getUserArchives(id).subscribe(
      data => this.archives = data
    );
  }

  getArchivesBought() {
    const id = localStorage.getItem('uid');
    this.client.getArchivesBought(id).subscribe(
      data => this.archivesBought = data
    );
  }

  getArchiveSaleCount(id: string) {
    this.client.getArchiveSaleCount(id).subscribe(
      data => this.saleCount = data
    );
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
