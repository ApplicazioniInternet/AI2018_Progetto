export class User {
    id: string = undefined;
    username: string = undefined;
    role: string = undefined;
    accountExpired: boolean = undefined;


    constructor(id?: string, username?: string, role?: string, accountExpired?: boolean) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.accountExpired = accountExpired;
    }
}
