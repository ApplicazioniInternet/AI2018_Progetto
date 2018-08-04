import { Injectable, Output, EventEmitter } from '@angular/core';
import { ClientHttpService } from './client-http.service';
import { Position } from './position';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  polygonPositions: Position[] = [];
  positionsForSale: Position[] = [];
  usersIdRequestList: string[] = [];

  dateMin: number;
  dateMax: number;

  constructor(private client: ClientHttpService) {}

  buyPositionsInArea(polygon: Position[]) {
    this.polygonPositions = polygon;
    this.client.buyArchives(polygon, this.dateMax, this.dateMin, this.usersIdRequestList).subscribe(() => {
      this.polygonPositions = [];
    });
  }

}
