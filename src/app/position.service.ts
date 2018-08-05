import { Injectable } from '@angular/core';
import { Position } from './position';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  polygonPositions: Position[] = [];
  usersIdRequestList: string[] = [];

  dateMin: number;
  dateMax: number;

  constructor() {}
}
