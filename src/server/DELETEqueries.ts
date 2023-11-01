import { WebSocket } from 'ws';
import { join } from 'path';
import { WebSocketMessage, WebSocketRequerst } from './server';
import { getErrorSender } from '@src/globalFunctions';
import { authResult } from './authorization';
import { DB } from './classes';
import { settings } from './settings';
import { rmSync } from 'fs-extra';

export interface deleteQuery extends WebSocketRequerst {
    type: 'delete';
}

export interface deleteOrganizationQuery extends deleteQuery {
    url: 'organization';
    targetID: number;
}

export interface deleteContractQuery extends deleteQuery {
    url: 'contract';
    targetID: number;
}

export interface deleteDeviceQuery extends deleteQuery {
    url: 'device';
    targetID: number;
}

export interface deleteBlockQuery extends deleteQuery {
    url: 'block';
    targetID: number;
}

export interface deleteDefectQuery extends deleteQuery {
    url: 'defect';
    targetID: number;
}

export interface deleteActionQuery extends deleteQuery {
    url: 'action';
    targetID: number;
}

export interface deleteActionMaterialQuery extends deleteQuery {
    url: 'actionMaterial';
    params: {
        actionID: number;
        materialID: number;
    };
}

export interface deleteMaterialQuery extends deleteQuery {
    url: 'material';
    targetID: number;
}

export interface deleteRepairDeviceQuery extends deleteQuery {
    url: 'repairDevice';
    targetID: number;
}

export interface deleteRepairNoteQuery extends deleteQuery {
    url: 'repairNote';
    targetID: number;
}

export interface deleteRepairBlockQuery extends deleteQuery {
    url: 'repairBlock';
    targetID: number;
}

export interface deleteBlockDefectQuery extends deleteQuery {
    url: 'blockDefect';
    params: {
        defectID: number;
        blockID: number;
    };
}

export interface deleteUserQuery extends deleteQuery {
    url: 'user';
    targetID: string;
}

export interface deleteBackUP extends deleteQuery {
    url: 'backup';
    params: {
        name: string;
    };
}

export function DELETEhandlers(
    socket: WebSocket,
    ResDB: DB,
    authDB: DB,
    request: WebSocketRequerst,
    user: authResult['user']
) {
    const sendError = getErrorSender(socket);
    if (user?.roots === 'watcher') {
        const messageBody: WebSocketMessage = {
            type: 'message',
            icon: 'error',
            text: 'Недостаточно прав',
        };
        socket.send(JSON.stringify(messageBody));
        return;
    }

    const AuthDBRun = authDB.getDBRun();
    const ResDBRun = ResDB.getDBRun();

    const { url } = request;

    let SQLquery: string = '';
    let SQLparams: (string | number)[] | [] = [];

    switch (url) {
        // Удаление устройства
        case 'device': {
            if (user?.roots === 'editor') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для удаления устройств',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { targetID } = request as deleteDeviceQuery;
            SQLquery = `DELETE FROM devices WHERE devices.id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление блока
        case 'block': {
            if (user?.roots === 'editor') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для удаления блока',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { targetID } = request as deleteBlockQuery;
            SQLquery = `DELETE FROM blocks WHERE blocks.id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление дефекта
        case 'defect': {
            const { targetID } = request as deleteDefectQuery;
            SQLquery = `DELETE FROM defects WHERE id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление действия
        case 'action': {
            const { targetID } = request as deleteActionQuery;
            SQLquery = `DELETE FROM actions WHERE actions.id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление материала в action
        case 'actionMaterial': {
            const { params } = request as deleteActionMaterialQuery;
            const { actionID, materialID } = params;
            SQLquery = `DELETE FROM materials_in_actions
                    WHERE action_id = ? AND material_id = ?`;
            SQLparams = [actionID, materialID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление материала
        case 'material': {
            const { targetID } = request as deleteMaterialQuery;
            SQLquery = `DELETE FROM materials WHERE materials.id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление организации
        case 'organization': {
            if (user?.roots === 'editor') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для удаления организации',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { targetID } = request as deleteOrganizationQuery;
            SQLquery = 'DELETE FROM organiztions WHERE organiztions.id = ?';
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление договора
        case 'contract': {
            if (user?.roots === 'editor') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для удаления контракта',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { targetID } = request as deleteContractQuery;
            SQLquery = 'DELETE FROM contracts WHERE contracts.id = ?';
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление устройства из ремонта
        case 'repairDevice': {
            const { targetID } = request as deleteRepairDeviceQuery;
            SQLquery = `DELETE FROM repair_devices WHERE repair_devices.id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление примечания к ремонту
        case 'repairNote': {
            const { targetID } = request as deleteRepairNoteQuery;
            SQLquery = `DELETE FROM repair_notes WHERE repair_notes.id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление ремонтируемого блока
        case 'repairBlock': {
            const { targetID } = request as deleteRepairBlockQuery;
            SQLquery = `DELETE FROM repair_blocks WHERE repair_blocks.id = ?`;
            SQLparams = [targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление дефекта из ремонтируемого блока
        case 'blockDefect': {
            const { params } = request as deleteBlockDefectQuery;
            const { blockID, defectID } = params;
            SQLquery = `DELETE FROM defects_in_repair WHERE defect_id=? AND repair_blocks_id=?`;
            SQLparams = [defectID, blockID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаление пользователя
        case 'user': {
            if (user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для удаления пользователя',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { targetID } = request as deleteUserQuery;
            SQLquery = `DELETE FROM users WHERE users.login = ?`;
            SQLparams = [targetID];
            AuthDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Удаелние файла бэкапа
        case 'backup': {
            if (user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для удаления бэкапа',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { params } = request as deleteBackUP;
            const { name } = params;
            const backupPath = join(settings.backUpsFolderPath, name);
            try {
                rmSync(backupPath);
            } catch (error) {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Неудалось удалить бэкап',
                };
                socket.send(JSON.stringify(messageBody));
            }
            break;
        }

        default:
            break;
    }
}
