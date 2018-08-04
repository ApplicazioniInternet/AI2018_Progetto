import {Component, Inject, OnInit} from '@angular/core';
import {PositionService} from '../../position.service';
import {ClientHttpService} from '../../client-http.service';
import {ArchiveId} from '../../archive-id';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  archives: ArchiveId[];
  emptyCart: boolean;

  constructor(
    private positionService: PositionService,
    private client: ClientHttpService) {
  }

  ngOnInit() {
    this.emptyCart = true;
    if (this.positionService.polygonPositions.length > 0) {
      this.client.listArchives(this.positionService.polygonPositions,
        this.positionService.dateMax, this.positionService.dateMin, this.positionService.usersIdRequestList)
        .subscribe(
          data => {
            console.log(data)
            this.archives = data;
            this.emptyCart = false;
          }
        );
    }
  }

  buy() {
    this.positionService.buyPositionsInArea(this.positionService.polygonPositions);
  }
}
