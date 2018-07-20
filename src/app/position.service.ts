import { Injectable, Output, EventEmitter } from '@angular/core';
import { ClientHttpService } from './client-http.service';
import {icon, latLng, marker, Marker, Polygon} from 'leaflet';
import { Observable } from 'rxjs';
import { Position } from './position';
import { PositionForm } from './customer/position-form';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  polygonPositions: Position[] = [];
  positionsForSale: Position[] = [];

  dateMin: number;
  dateMax: number;

  @Output() clearAllPositions: EventEmitter<void> = new EventEmitter();
  @Output() boughtPositions: EventEmitter<void> = new EventEmitter();

  constructor(private client: ClientHttpService) {}

  buyPositionsInArea(polygon: Position[]) {
    this.polygonPositions = polygon;
    this.client.buyPositions(polygon, this.dateMax, this.dateMin).subscribe(() => {
      this.boughtPositions.emit();
    });
  }

  private isPositionsInPolygon(point: Position, polygon: Position[]): Boolean {
    const x = point.longitude;
    const y = point.latitude;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude, yi = polygon[i].latitude;
      const xj = polygon[j].longitude, yj = polygon[j].latitude;

      const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) { inside = !inside; }
    }
    return inside;
  }

  countPositionsInPolygon(polygon: Position[]): number {
    let count = 0;

    for (const pos of this.positionsForSale) {
      if (this.isPositionsInPolygon(pos, polygon)) {
        count++;
      }
    }
    return count;
  }

  notifyRemoveAllPosition(): void {
    this.clearAllPositions.emit();
    this.polygonPositions = [];
  }
}
