import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {PositionService} from '../../position.service';
import {ClientHttpService} from '../../client-http.service';
import {Observable} from 'rxjs';
import {Archive} from '../../archive';

@Component({
  selector: 'app-dialogoverview',
  templateUrl: './dialog-overview.component.html',
  styleUrls: ['./dialog-overview.component.css']
})
export class DialogOverviewComponent implements OnInit {
    archives: Archive[];

    constructor(
        public dialogRef: MatDialogRef<DialogOverviewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private positionService: PositionService,
        private client: ClientHttpService) {
    }

    ngOnInit() {
        this.getListOfArchivesInArea().subscribe(
          data => this.archives = data
        );
    }

    onAnnullaClick(): void {
        this.dialogRef.close();
    }

    confermaAcquistoPosizioni(): void {
      this.positionService.buyPositionsInArea(this.positionService.polygonPositions);

      this.dialogRef.afterClosed().subscribe(() => {
        this.positionService.notifyRemoveAllPosition();
      });

      this.dialogRef.close();
    }

    getListOfArchivesInArea(): Observable<Archive[]> {
      return this.client.listArchives(this.positionService.polygonPositions,
        this.positionService.dateMax, this.positionService.dateMin, this.positionService.usersIdRequestList);
    }
}
