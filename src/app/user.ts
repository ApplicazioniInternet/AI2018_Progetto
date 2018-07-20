export class User {
    id: number = undefined;
    username: string = undefined;
    role: string = undefined;
    accountExpired: boolean = undefined;


    constructor(id: number, username: string, role: string, accountExpired: boolean) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.accountExpired = accountExpired;
    }
}
