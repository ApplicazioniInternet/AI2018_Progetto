export class Position {
    id: number = undefined;
    latitude: number = undefined;
    longitude: number = undefined;
    timestamp: number = undefined;
    userId: string = undefined;

    constructor (id?: number, latitude?: number, longitude?: number, timestamp?: number, userId?: string) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
        this.userId = userId;
    }
}
