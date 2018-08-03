import { Injectable, Output, EventEmitter } from '@angular/core';
import { ClientHttpService } from './client-http.service';
import {icon, latLng, marker, Marker, Polygon} from 'leaflet';
import { Observable } from 'rxjs';
import { Position } from './position';
import { PositionForm } from './user/buy/position-form';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  polygonPositions: Position[] = [];
  positionsForSale: Position[] = [];
  usersIdRequestList: string[] = [];

  dateMin: number;
  dateMax: number;

  @Output() clearAllPositions: EventEmitter<void> = new EventEmitter();
  @Output() boughtPositions: EventEmitter<void> = new EventEmitter();

  constructor(private client: ClientHttpService) {}

  buyPositionsInArea(polygon: Position[]) {
    this.polygonPositions = polygon;
    this.client.buyArchives(polygon, this.dateMax, this.dateMin, this.usersIdRequestList).subscribe(() => {
      this.boughtPositions.emit();
    });
  }

  notifyRemoveAllPosition(): void {
    this.clearAllPositions.emit();
    this.polygonPositions = [];
  }
}
