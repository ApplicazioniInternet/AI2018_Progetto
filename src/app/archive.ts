export class Archive {
  id: string = undefined;
  userId: string = undefined;
  positions: Position[] = undefined;

  constructor (id?: string, userId?: string, positions?: Position[]) {
    this.id = id;
    this.userId = userId;
    this.positions = positions;
  }
}