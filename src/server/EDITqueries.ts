import {
    fileAvailable,
    formatToNumbericTime,
    getErrorSender,
} from '@src/globalFunctions';
import { WebSocketMessage, WebSocketRequerst } from './server';
import WebSocket from 'ws';
import { authResult, roots } from './authorization';
import { SHA256 } from 'crypto-js';
import { accessSync, constants as FSconts, statSync } from 'fs';
import { setSettings, settings } from './settings';
import { DB } from './classes';
import path from 'path';

interface editQuery extends WebSocketRequerst {
    type: 'edit';
}

export interface editDeviceQueryBody extends editQuery {
    url: 'device';
    targetID: number;
    params: {
        name: string;
        decimal: string;
    };
}

export interface editOrganizationQueryBody extends editQuery {
    url: 'organization';
    targetID: number;
    params: {
        name: string;
        city: string;
    };
}

export interface editContractQueryBody extends editQuery {
    url: 'contract';
    targetID: number;
    params: {
        number: string;
        date: string;
    };
}

export interface editUnitContractJSONQueryBody extends editQuery {
    url: 'editUnitContractJSON';
    targetID: number;
    params: {
        JSON: string;
    };
}

export interface editBlockQueryBody extends editQuery {
    url: 'block';
    targetID: number;
    params: {
        name: string;
        decimal: string;
    };
}

export interface editDefectQueryBody extends editQuery {
    url: 'defect';
    targetID: number;
    params: {
        blockID: number;
        description: string;
        defect: string;
        solution: string;
    };
}

export interface editActionQueryBody extends editQuery {
    url: 'action';
    targetID: number;
    params: {
        index: string;
        action: string;
    };
}

export interface editActionMaterialQueryBody extends editQuery {
    url: 'actionMaterial';
    params: {
        actionID: number;
        materialID: number;
        count: number;
    };
}

export interface editMaterialQueryBody extends editQuery {
    url: 'material';
    targetID: number;
    params: {
        name: string;
        unit: string;
    };
}

export interface editRepairDeviceQueryBody extends editQuery {
    url: 'repairDevice';
    targetID: number;
    params: {
        serialNumber: string;
        repairNumber: number;
    };
}

export interface setDividedQueryBody extends editQuery {
    url: 'divided';
    targetID: number;
    params: {
        divided: boolean;
    };
}

export interface editRepairBlock extends editQuery {
    url: 'repairBlock';
    targetID: number;
    params: {
        count: number;
        serialNumber: string;
    };
}

export interface editUserPassword extends editQuery {
    url: 'userPassword';
    params: {
        login: string;
        password: string;
    };
}

export interface editUserRoots extends editQuery {
    url: 'userRoots';
    params: {
        login: string;
        roots: roots;
    };
}

export interface editDocsPath extends editQuery {
    url: 'docsPath' | 'blanksPath';
    params: {
        newPath: string;
    };
}

export interface switchWebInterface extends editQuery {
    url: 'switchWebInterface';
    params: {
        isON: boolean;
    };
}

export interface createBackUP extends editQuery {
    url: 'createDBBackUP';
}

export interface setBackUP extends editQuery {
    url: 'setBackUP';
    params: {
        backUPname: string;
    };
}

export async function EDIThandlers(
    socket: WebSocket,
    resDB: DB,
    authDB: DB,
    request: WebSocketRequerst,
    user: authResult['user']
) {
    const sendError = getErrorSender(socket);
    if (user?.roots === 'watcher') {
        sendError({}, 'Нет доступа');
        return;
    }
    const ResDBRun = resDB.getDBRun();
    const ResDBExec = resDB.getDBExec();

    const authDBRun = resDB.getDBRun();

    const changeTime = new Date().getTime();

    let SQLquery: string = '';
    let SQLparams: (string | number)[] | [] = [];

    const { url } = request;
    switch (url) {
        // Редактирование устройства
        case 'device': {
            const { params, targetID } = request as editDeviceQueryBody;
            const { decimal, name } = params;
            SQLquery = `UPDATE devices 
                SET name = ?, decimal = ?
                WHERE devices.id == ?`;
            SQLparams = [name, decimal, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование блока
        case 'block': {
            const { params, targetID } = request as editBlockQueryBody;
            const { decimal, name } = params;
            SQLquery = `UPDATE blocks 
            SET name = ?, decimal = ?
            WHERE blocks.id = ?`;
            SQLparams = [name, decimal, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование неисправности
        case 'defect': {
            const { params, targetID } = request as editDefectQueryBody;
            const { blockID, defect, description, solution } = params;
            SQLquery = `UPDATE defects 
            SET description = ?, defect = ?, solution = ?, block_id = ?
            WHERE defects.id = ?`;
            SQLparams = [description, defect, solution, blockID, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
        }

        // Редактирование действия
        case 'action': {
            const { params, targetID } = request as editActionQueryBody;
            const { action, index } = params;
            SQLquery = `UPDATE actions
                SET "action" = ?, "index" = ?
                WHERE actions.id = ?`;
            SQLparams = [action, index, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование материала в действии
        case 'actionMaterial': {
            const { params } = request as editActionMaterialQueryBody;
            const { actionID, count, materialID } = params;
            SQLquery = `UPDATE materials_in_actions
            SET count = ?
            WHERE action_id = ? AND material_id = ?`;
            SQLparams = [count, actionID, materialID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование материала
        case 'material': {
            const { params, targetID } = request as editMaterialQueryBody;
            const { name, unit } = params;
            SQLquery = `UPDATE materials
            SET name = ?, unit = ?
            WHERE materials.id = ?`;
            SQLparams = [name, unit, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование организации-заказчика
        case 'organization': {
            const { params, targetID } = request as editOrganizationQueryBody;
            const { city, name } = params;
            SQLquery = `UPDATE organiztions
            SET name = ?, city = ? 
            WHERE organiztions.id = ?`;
            const SQLparams = [name, city, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактоирование договора
        case 'contract': {
            const { params, targetID } = request as editContractQueryBody;
            const { date, number } = params;
            SQLquery = `UPDATE contracts
            SET "date" = ?, number = ?
            WHERE contracts.id = ?`;
            SQLparams = [date, number, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование JSON данных в ед. договорах
        case 'editUnitContractJSON': {
            const { params, targetID } =
                request as editUnitContractJSONQueryBody;
            const { JSON } = params;
            SQLquery = `UPDATE repair_devices
            SET unit_contracts_json = ?
            WHERE repair_devices.id = ?`;
            SQLparams = [JSON, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование устройства в ремонте
        case 'repairDevice': {
            const { params, targetID } = request as editRepairDeviceQueryBody;
            const { repairNumber, serialNumber } = params;
            SQLquery = `UPDATE repair_devices
            SET repair_number = ?, serial_number = ?, change_time = ?
            WHERE repair_devices.id = ?`;
            SQLparams = [repairNumber, serialNumber, changeTime, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование блока в ремонте
        case 'repairBlock': {
            const { params, targetID } = request as editRepairBlock;
            const { count, serialNumber } = params;
            SQLquery = `UPDATE repair_blocks SET count = ${count}, serial_number = "${serialNumber}" WHERE repair_blocks.id = ${targetID};
            UPDATE repair_devices SET change_time = ${changeTime} WHERE repair_devices.id = (
                        SELECT repair_blocks.repair_device_id
                        FROM repair_blocks
                        WHERE repair_blocks.id = (SELECT repair_blocks.id FROM repair_blocks WHERE repair_blocks.id = ${targetID})
                    );`;
            ResDBExec(SQLquery)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Установка флага divided
        case 'divided': {
            const { params, targetID } = request as setDividedQueryBody;
            const { divided } = params;
            SQLquery = `UPDATE repair_devices SET divided = ?, change_time = ? WHERE repair_devices.id = ?;`;
            SQLparams = [+divided, changeTime, targetID];
            ResDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Редактирование пароля пользователя
        case 'userPassword': {
            const { params } = request as editUserPassword;
            const { login, password } = params;
            if (login !== user?.login && user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Нет прав на редактирование пароля другого пользователя',
                };
                socket.send(JSON.stringify(messageBody));
                break;
            }
            const passwordHash = SHA256(password).toString();
            SQLquery = `UPDATE users SET password_hash = ? WHERE users.login = ?`;
            authDBRun(SQLquery, [passwordHash, login])
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Установка прав пользователю
        case 'userRoots': {
            if (user?.roots !== 'admin') {
                sendError({}, 'Недостаточно прав для изменения ролей');
                return;
            }
            const { params } = request as editUserRoots;
            const { login, roots } = params;
            if (roots === 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Устанавливать больше одного администратора запрещено политикой безопасности',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            } else if (login === user.login) {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Админ это не привелегия. Это судьба. Тебе не избавится здесь от этого.',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            SQLquery = `UPDATE users SET roots = ? WHERE users.login = ?`;
            SQLparams = [roots, login];
            authDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        // Изменение пути хранения документов
        case 'docsPath': {
            if (user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для изменения пути хранения',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { params } = request as editDocsPath;
            const { newPath } = params;
            let isPathValid: boolean = false;
            try {
                accessSync(newPath, FSconts.W_OK);
                const stats = statSync(newPath);
                if (stats.isDirectory()) {
                    isPathValid = true;
                }
            } catch (err) {}
            if (isPathValid) {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Указаный путь не существует',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            setSettings({ documentsFolderPath: newPath });
            break;
        }

        case 'createDBBackUP': {
            if (user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для создания бэкапа',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const createTime = formatToNumbericTime(
                new Date().getTime()
            ).replace(':', '.');
            const outPath = path.join(
                settings.backUpsFolderPath,
                `BU ${createTime}.db`
            );
            resDB.createBackUP(outPath);
            break;
        }

        case 'setBackUP': {
            if (user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для применения бэкапа',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { params } = request as setBackUP;
            const { backUPname } = params;
            const backUPpath = path.resolve(
                settings.backUpsFolderPath,
                backUPname
            );
            if (!fileAvailable(backUPpath)) {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Файл не найден или к нему нет доступа',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            resDB.getBackUP(backUPpath);
            break;
        }

        // Изменение пути хранения бланков
        case 'blanksPath': {
            if (user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для изменения пути хранения',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { params } = request as editDocsPath;
            const { newPath } = params;
            let isPathValid: boolean = false;
            try {
                accessSync(newPath, FSconts.W_OK);
                const stats = statSync(newPath);
                if (stats.isDirectory()) {
                    isPathValid = true;
                }
            } catch (err) {}
            if (isPathValid) {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Указанный путь не существует',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            setSettings({ blanksFolerPath: newPath });
            break;
        }

        case 'switchWebInterface': {
            if (user?.roots !== 'admin') {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: 'Недостаточно прав для включения/отключения веб-интерфейса',
                };
                socket.send(JSON.stringify(messageBody));
                return;
            }
            const { params } = request as switchWebInterface;
            const { isON } = params;
            setSettings({ enableWebVersion: isON });
            break;
        }

        default:
            break;
    }
}
