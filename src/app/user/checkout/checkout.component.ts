import {Component, Inject, OnInit} from '@angular/core';
import {PositionService} from '../../position.service';
import {ClientHttpService} from '../../client-http.service';
import {ArchiveLight} from '../../archive-light';
import {MatSnackBar, MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  archives: ArchiveLight[];
  emptyCart: boolean;

  displayedColumns: string[] = ['select', 'id', 'bought'];
  dataSource;
  selection;

  constructor(
    private positionService: PositionService,
    private client: ClientHttpService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.emptyCart = true;
    if (this.positionService.polygonPositions.length > 0) {
      this.client.listArchives(this.positionService.polygonPositions,
        this.positionService.dateMax, this.positionService.dateMin, this.positionService.usersIdRequestList)
        .subscribe(
          data => {
            this.archives = data;
            if (this.archives.length > 0) {
              this.emptyCart = false;
              this.dataSource = new MatTableDataSource<ArchiveLight>(this.archives);
              this.selection = new SelectionModel<ArchiveLight>(true, []);
            }
          }
        );
    }
  }

  buy() {
    this.client.buyArchives(this.selection.selected).subscribe(
      (data) => this.openSnackBar('Transazione avvenuta con successo.', 'OK'),
      () => this.openSnackBar('Transazione fallita', 'OK')
    );
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
