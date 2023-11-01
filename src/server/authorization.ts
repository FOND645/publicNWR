import { SHA256 } from 'crypto-js';
import { DB } from './classes';

export type roots = 'admin' | 'editor' | 'watcher';

type TauthedUser = {
    login: string;
    connectionID: string;
    clientAddres: undefined | string,
    roots: roots;
};

type TauthedUsers = {
    [connectionID: string]: TauthedUser;
};

export type authResult = {
    status: boolean;
    user?: TauthedUser;
    reason?: string;
};

export let authedUsers: TauthedUsers = {};

export async function authorization(
    login: string,
    password: string,
    clientAddres: string | undefined,
    connectionID: string,
    authDB: DB
) {
    const dbAll = authDB.getDBAll();
    const passwordHash = SHA256(password).toString();
    const SQLquery = `SELECT roots FROM users WHERE users.login = ? AND users.password_hash = ?`;
    const result = await dbAll<{ roots: TauthedUser['roots'] }[]>(SQLquery, [
        login,
        passwordHash,
    ]);
    if (result.length !== 0) {
        authedUsers[connectionID] = {
            connectionID,
            clientAddres,
            login,
            roots: result[0].roots,
        };
        return { status: true, user: authedUsers[connectionID] } as authResult;
    } else {
        return { status: false } as authResult;
    }
}

export function isAuthed(connectionID: string): boolean {
    return authedUsers.hasOwnProperty(connectionID);
}

export function getUserRoots(connectionID: string): string {
    return authedUsers[connectionID].roots;
}

export function deAuthorize(connectionID: string) {
    delete authedUsers[connectionID];
}

export function getUserByAddr(Addr: string) {
    for (let connect in authedUsers){
        const authedUser = authedUsers[connect]
        if(authedUser.clientAddres === Addr) return authedUser
    }
    return undefined
}