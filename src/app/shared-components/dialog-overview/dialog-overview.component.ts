import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {PositionService} from '../../position.service';

@Component({
  selector: 'app-dialogoverview',
  templateUrl: './dialog-overview.component.html',
  styleUrls: ['./dialog-overview.component.css']
})
export class DialogOverviewComponent implements OnInit {
    counter: number;

    constructor(
        public dialogRef: MatDialogRef<DialogOverviewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private positionService: PositionService) {
    }

    ngOnInit() {
        this.counter = this.getNumberOfPositionsInArea();
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

    getNumberOfPositionsInArea(): number {
        return this.positionService.countPositionsInPolygon(this.positionService.polygonPositions);
    }
}
