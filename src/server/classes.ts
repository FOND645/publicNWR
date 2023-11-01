import { copyFileSync, rmSync } from 'fs-extra';
import { Database } from 'sqlite3';

export type dbRunResult = {
    lastID: number;
    changes: number;
};

export class DB {
    database: Database;
    readonly DBpath: string;
    isDBopen() {
        let result: boolean = false;
        try {
            this.database.run('SELECT last_insert_rowid()', (error) => {
                if (error) {
                    result = false;
                } else {
                    result = true;
                }
            });
        } catch (error) {
            result = false;
        }
        return result;
    }
    stop() {
        if (this.isDBopen()) {
            this.database.close();
        }
    }

    start() {
        if (!this.isDBopen()) this.database = new Database(this.DBpath);
    }

    createBackUP(outPath: string) {
        copyFileSync(this.DBpath, outPath);
    }

    getBackUP(backUPPath: string) {
        this.stop();
        rmSync(this.DBpath);
        copyFileSync(backUPPath, this.DBpath);
        this.start();
    }

    getDBRun() {
        return (SQLquery: string, SQLparams: (number | string)[]) =>
            new Promise<dbRunResult>((resolve, reject) => {
                this.database?.run(SQLquery, SQLparams, function (error) {
                    if (error) {
                        console.log(
                            `Запрос:\n${SQLquery}\nс параметрами\n${SQLparams}\nзаконичлся с ошибкой\n${error}`
                        );
                        reject(error);
                    } else {
                        resolve({
                            lastID: this.lastID,
                            changes: this.changes,
                        });
                    }
                });
            });
    }

    getDBAll() {
        return <T>(
            SQLquery: string,
            SQLparams: (number | string)[]
        ): Promise<T> => {
            return new Promise((resolve, reject) => {
                this.database?.all(
                    SQLquery,
                    SQLparams,
                    function (error: Error | null, result: T) {
                        if (error) {
                            console.log(
                                `Request:\n${SQLquery}\nparanetrs:\n${SQLparams}\nended with error:\n${error}`
                            );
                            reject(error as Error);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });
        };
    }

    getDBExec() {
        return (SQLquery: string) =>
            new Promise<void>((resolve, reject) => {
                this.database?.exec(SQLquery, function (error) {
                    if (error) {
                        console.log(
                            `Request:\n${SQLquery}\nended with error:\n${error}`
                        );
                        reject(error);
                    }
                });
            });
    }

    constructor(path: string) {
        this.DBpath = path;
        this.database = new Database(this.DBpath);
    }
}
