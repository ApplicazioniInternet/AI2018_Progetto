export class User {
    id: string = undefined;
    username: string = undefined;
    role: string = undefined;
    accountExpired: boolean = undefined;
    markerColor: string = undefined;

    constructor(id?: string, markerColor?: string, username?: string, role?: string, accountExpired?: boolean) {
        this.id = id;
        this.markerColor = markerColor;
        this.username = username;
        this.role = role;
        this.accountExpired = accountExpired;
    }
}
