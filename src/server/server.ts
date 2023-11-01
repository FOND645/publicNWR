import express from 'express';
import path from 'path';
import { GEThandlers } from './GETqueries';
import { EDIThandlers } from './EDITqueries';
import { DELETEhandlers } from './DELETEqueries';
import { ADDhandlers } from './ADDqueries';
import WebSocket from 'ws';
import { authParams } from '@src/globalTypes';
import {
    authResult,
    authorization,
    deAuthorize,
    getUserByAddr,
} from './authorization';
import { settings } from '@src/server/settings';
import { Menu, Tray, app, nativeImage } from 'electron';
import { DB } from './classes';
import multer from 'multer';
import { mkdirSync } from 'fs-extra';
import { folderExists } from '@src/globalFunctions';

const authBDpath = path.resolve(__dirname, 'auth.db');
const authDB = new DB(authBDpath);
authDB.start();

const dbPath = path.join(__dirname, `NWR.db`);
const ResDB = new DB(dbPath);
ResDB.start();

const WS = new WebSocket.Server({ port: settings.WebSocketPort }, () =>
    console.log(`WebSocket is launched on port # ${settings.WebSocketPort}`)
);

export interface WebSocketRequerst {
    type: 'get' | 'add' | 'edit' | 'delete';
    url: string;
    targetID?: number | string;
    params?: unknown;
}

export interface WebSocketMessage {
    type: 'message';
    icon: 'warning' | 'error' | 'success' | undefined;
    text: string;
}

export type WebSocketResponse<T> = WebSocketRequerst & {
    response: T;
};

WS.on('connection', async (socket, request) => {
    const connectionKiller: NodeJS.Timeout = setTimeout(() => {
        console.log('Auth timeout');
        socket.close(1008);
    }, 2000);
    const clientAddres = request.socket.remoteAddress;
    const connectionID = request.headers['sec-websocket-key'] as string;
    console.log(`Auth query - <${connectionID}>`);
    let authResult: undefined | authResult;
    await new Promise((resolve, reject) => {
        const authListner = async (data: WebSocket.MessageEvent) => {
            const authData: authParams = JSON.parse(data.data.toString());
            const { login, password } = authData;
            authResult = await authorization(
                login,
                password,
                clientAddres,
                connectionID,
                authDB
            );
            if (authResult.status) {
                socket.removeEventListener('message', authListner);
                socket.send(JSON.stringify(authResult));
                clearTimeout(connectionKiller);
                console.log('Auth is success');
                resolve(true);
            } else {
                socket.send(JSON.stringify(authResult));
                socket.close(1008, 'Неправильный логин и(или) пароль');
                clearTimeout(connectionKiller);
                console.log('Auth is unsuccess');
                resolve(false);
            }
        };
        socket.addEventListener('message', authListner);
    });

    const dataBaseEventListner = () => {
        const message = {
            type: 'DBupdated',
        };
        socket.send(JSON.stringify(message));
    };

    ResDB.database?.addListener('change', dataBaseEventListner);

    if (authResult?.user?.roots === 'admin') {
        authDB.database?.on('change', (sql) => {
            const message = {
                type: 'DBupdated',
            };
            socket.send(JSON.stringify(message));
        });
    }

    socket.on('message', (data) => {
        const request: WebSocketRequerst = JSON.parse(data.toString());
        console.log(`Incoming request: ${JSON.stringify(request, null, 2)}`);
        switch (request.type) {
            case 'get':
                GEThandlers(socket, ResDB, authDB, request, authResult?.user);
                break;
            case 'add':
                ADDhandlers(socket, ResDB, authDB, request, authResult?.user);
                break;
            case 'delete':
                DELETEhandlers(
                    socket,
                    ResDB,
                    authDB,
                    request,
                    authResult?.user
                );
                break;
            case 'edit':
                EDIThandlers(socket, ResDB, authDB, request, authResult?.user);
                break;
            default:
                break;
        }
    });
    socket.on('close', () => {
        deAuthorize(connectionID);
        ResDB.database?.removeListener('change', dataBaseEventListner);
    });
});

const server = express();

export interface SendFileParamsJSON {
    type: 'note' | 'mail' | 'contract' | 'photo';
    contractID: number;
    repairDeviceID: number;
}

const scansStorage = multer.diskStorage({
    destination(req, file, callback) {
        const typeFolder = {
            note: 'Описи',
            mail: 'Письма',
            contract: 'Контракт',
            photo: 'Фото',
        };
        const { documentsFolderPath } = settings;
        const fileParams = JSON.parse(req.params.fileParams);
        const { contractID, repairDeviceID, type } =
            fileParams as SendFileParamsJSON;

        [
            path.resolve(documentsFolderPath, contractID.toString()),
            path.resolve(
                documentsFolderPath,
                contractID.toString(),
                typeFolder[type]
            ),
            path.resolve(
                documentsFolderPath,
                contractID.toString(),
                typeFolder[type],
                repairDeviceID.toString()
            ),
        ].forEach((folderPath) => {
            if (!folderExists(folderPath)) mkdirSync(folderPath);
        });

        const destination =
            type === 'note' || type === 'photo'
                ? path.resolve(
                      documentsFolderPath,
                      contractID.toString(),
                      typeFolder[type],
                      repairDeviceID.toString()
                  )
                : path.resolve(
                      documentsFolderPath,
                      contractID.toString(),
                      typeFolder[type]
                  );

        callback(null, destination);
    },
    filename(req, file, callback) {
        callback(null, file.filename);
    },
});

const uploader = multer({ storage: scansStorage });

server.use('/upload', (req, res, next) => {
    const addr = req.socket.remoteAddress;
    if (!addr) return;
    const user = getUserByAddr(addr);
    if (!user) return;
    if (user.roots === 'watcher') return;
    next();
});

server.use((req, res, next) => {
    console.log(req.url)
    next()
})

server.post('/upload', uploader.single('file'), (req, res) => {});

server.get('/image/note/:contractID/:repairDeviceID/:fileName', (req, res) => {
    const { contractID, repairDeviceID, fileName } = req.params;
    const filePath = path.resolve(
        settings.documentsFolderPath,
        contractID,
        'Описи',
        repairDeviceID,
        fileName
    )
    console.log(filePath)
    res.sendFile(filePath);
});

server.get('/image/photo/:contractID/:repairDeviceID/:fileName', (req, res) => {
    const { contractID, repairDeviceID, fileName } = req.params;
    res.sendFile(
        path.resolve(
            settings.documentsFolderPath,
            contractID,
            'Фото',
            repairDeviceID,
            fileName
        )
    );
});

server.get('/file/contract/:contractID/:fileName', (req, res) => {
    const { contractID, fileName } = req.params;
    res.sendFile(
        path.resolve(
            settings.documentsFolderPath,
            contractID,
            'Контракт',
            fileName
        )
    );
});

server.get('/file/mail/:contractID/:fileName', (req, res) => {
    const { contractID, fileName } = req.params;
    res.sendFile(
        path.resolve(
            settings.documentsFolderPath,
            contractID,
            'Письма',
            fileName
        )
    );
});

server.listen(settings.WebInterfacePort, () =>
    console.log(`Listen HTTP on port # ${settings.WebInterfacePort}`)
);

let tray: null | Tray = null;
const contextMenuItems: Electron.MenuItemConstructorOptions[] = [
    {
        label: 'Закрыть',
        click: () => app.quit(),
    },
];
const contextMenu = Menu.buildFromTemplate(contextMenuItems);

app.on('ready', () => {
    tray = new Tray(nativeImage.createEmpty());
    tray.setContextMenu(contextMenu);
});
