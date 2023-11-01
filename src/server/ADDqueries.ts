import {
    fileAvailable,
    folderExists,
    getErrorSender,
} from '@src/globalFunctions';
import path from 'path';
import { WebSocketMessage, WebSocketRequerst } from './server';
import { WebSocket } from 'ws';
import { authResult, roots } from './authorization';
import { SHA256 } from 'crypto-js';
import { createFileSync, mkdirSync, writeFile } from 'fs-extra';
import { settings } from './settings';
import { createActionList, createDefectList } from './DocsCreator';
import { DB } from './classes';

export type addNewDefectQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'defect';
    params: {
        blockID: number;
        description: string;
        defect: string;
        solution: string;
    };
};

export type addActionToDefectQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'action';
    params: {
        action: string;
        index: string;
        defectID: number;
    };
};

export type addNewMaterialQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'material';
    params: {
        name: string;
        unit: string;
    };
};

export type addNewDeviceQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'device';
    params: {
        name: string;
        decimal: string;
    };
};

export type addNewBlockQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'block';
    params: {
        deviceID: number;
        name: string;
        decimal: string;
    };
};

export type addNewRepairNoteQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'note';
    params: {
        repairDeviceID: number;
        text: string;
    };
};

export type addOrganizationQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'organization';
    params: {
        name: string;
        city: string;
    };
};

export type addContractQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'contract';
    params: {
        number: string;
        date: string;
        organizationID: number;
    };
};

export type addRepairDeviceQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'repairDevice';
    params: {
        contractID: number;
        deviceID: number;
        repairNumber: undefined | number;
        serialNumber: string;
        unitContractJSON: string;
    };
};

export type addExitActionQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'existAction';
    params: {
        defectID: number;
        actionID: number;
    };
};

export type addRepairBlockBoyQuery = WebSocketRequerst & {
    type: 'add';
    url: 'repairBlock';
    params: {
        repairDeviceID: number;
        blockID: number;
        serialNumber: string;
        count: number;
    };
};

export type addActionMaterialQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'actionMaterial';
    params: {
        actionID: number;
        materialID: number;
        count: number;
    };
};

export type addDefectToBlockQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'defectToBlock';
    params: {
        repairBlockID: number;
        defectID: number;
    };
};

export type actionSQL = {
    id: number;
    action: string;
    index: string;
    defect_id: number;
};

export type materialsInActionsSQL = {
    action_id: number;
    material_id: number;
    count: number;
};

export type addUserQueryBody = WebSocketRequerst & {
    type: 'add';
    url: 'user';
    params: {
        login: string;
        roots: roots;
        password: string;
    };
};

export type addDefectBlank = WebSocketRequerst & {
    type: 'add';
    url: 'defectBlank';
    params: {
        contractID: number;
        repairDeviceID: number;
        rawFile: string;
    };
};

export type addActionBlank = WebSocketRequerst & {
    type: 'add';
    url: 'actionBlank';
    params: {
        contractID: number;
        repairDeviceID: number;
        rawFile: string;
    };
};

export type createDefectList = WebSocketRequerst & {
    type: 'add';
    url: 'createDefectList';
    params: {
        repairDeviceID: number;
    };
};

export type copyDefect = WebSocketRequerst & {
    type: 'add';
    url: 'copyDefect';
    params: {
        defectID: number;
    };
};

export type createActionList = WebSocketRequerst & {
    type: 'add';
    url: 'createActionList';
    params: {
        repairDeviceID: number;
    };
};

export async function ADDhandlers(
    socket: WebSocket,
    ResDB: DB,
    authDB: DB,
    request: WebSocketRequerst,
    user: authResult['user']
) {
    const sendError = getErrorSender(socket);
    if (user?.roots === 'watcher') {
        sendError({}, 'Нет доступа');
        return;
    }
    const ResDBRun = ResDB.getDBRun();
    const ResDBAll = ResDB.getDBAll();
    const ResDBExec = ResDB.getDBExec();

    const AuthDBRun = authDB.getDBRun();

    const changeTime = new Date().getTime();

    let SQLquery: string = '';
    let SQLparams: (string | number)[] | [] = [];

    switch (request.url) {
        case 'createDefectList': {
            const { params } = request as createDefectList;
            const { repairDeviceID } = params;
            const result = await createDefectList(repairDeviceID, ResDB);
            if (!result.isSuccess) {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: `${result.message}\n${JSON.stringify(
                        result.error,
                        null,
                        2
                    )}`,
                };
                socket.send(JSON.stringify(messageBody));
            }
            break;
        }

        case 'createActionList': {
            const { params } = request as createDefectList;
            const { repairDeviceID } = params;
            const result = await createActionList(repairDeviceID, ResDB); //.catch(error => console.log(error));
            if (!result.isSuccess) {
                const messageBody: WebSocketMessage = {
                    type: 'message',
                    icon: 'error',
                    text: `${result.message}\n${JSON.stringify(
                        result.error,
                        null,
                        2
                    )}`,
                };
                socket.send(JSON.stringify(messageBody));
            }
            break;
        }

        case 'defectBlank':
            {
                const { params } = request as addDefectBlank;
                const { contractID, repairDeviceID, rawFile } = params;
                SQLquery = `SELECT repair_devices.device_id AS "deviceID"
                FROM repair_devices
                WHERE repair_devices.id = ?`;
                const [{ deviceID }] = await ResDBAll<[{ deviceID: number }]>(
                    SQLquery,
                    [repairDeviceID]
                );
                const outDir = path.resolve(
                    settings.blanksFolerPath,
                    contractID.toString()
                );
                const outPath = path.resolve(
                    outDir,
                    `${deviceID}_defectBlank.xlsx`
                );
                if (!folderExists(outDir)) mkdirSync(outDir);
                if (!fileAvailable(outPath)) createFileSync(outPath);
                writeFile(outPath, rawFile, { encoding: 'binary' });
            }
            break;

        case 'actionBlank':
            {
                const { params } = request as addActionBlank;
                const { contractID, repairDeviceID, rawFile } = params;
                SQLquery = `SELECT repair_devices.device_id AS "deviceID"
                FROM repair_devices
                WHERE repair_devices.id = ?`;
                const [{ deviceID }] = await ResDBAll<[{ deviceID: number }]>(
                    SQLquery,
                    [repairDeviceID]
                );
                const outDir = path.resolve(
                    settings.blanksFolerPath,
                    contractID.toString()
                );
                const outPath = path.resolve(
                    outDir,
                    `${deviceID}_actionBlank.xlsx`
                );
                if (!folderExists(outDir)) mkdirSync(outDir);
                if (!fileAvailable(outPath)) createFileSync(outPath);
                writeFile(outPath, rawFile, { encoding: 'binary' });
            }
            break;

        case 'defect':
            {
                const { params } = request as addNewDefectQueryBody;
                const { blockID, defect, description, solution } = params;
                SQLquery = `INSERT INTO defects (description, defect, solution, block_id) VALUES (?, ?, ?, ?)`;
                SQLparams = [description, defect, solution, blockID];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'action':
            {
                const { params } = request as addActionToDefectQueryBody;
                const { action, defectID, index } = params;
                SQLquery = `INSERT INTO actions ("action", "index", "defect_id") VALUES (?, ?, ?)`;
                SQLparams = [action, index, defectID];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'actionMaterial':
            {
                const { params } = request as addActionMaterialQueryBody;
                const { actionID, count, materialID } = params;
                SQLquery = `INSERT INTO materials_in_actions (action_id, material_id, "count") VALUES (?, ?, ?)`;
                SQLparams = [actionID, materialID, count];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'material':
            {
                const { params } = request as addNewMaterialQueryBody;
                const { name, unit } = params;
                SQLquery = `INSERT INTO materials (name, unit) VALUES (?, ?)`;
                SQLparams = [name, unit];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'device':
            {
                const { params } = request as addNewDeviceQueryBody;
                const { decimal, name } = params;
                SQLquery = `INSERT INTO devices (name, decimal) VALUES (?, ?)`;
                SQLparams = [name, decimal];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'block':
            {
                const { params } = request as addNewBlockQueryBody;
                const { decimal, deviceID, name } = params;
                SQLquery = `INSERT INTO blocks (name, decimal) VALUES (${name}, ${decimal});
            INSERT INTO blocks_in_devices (device_id, block_id) VALUES (${deviceID}, (SELECT last_insert_rowid() AS id));`;
                ResDBExec(SQLquery)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'organization':
            {
                const { params } = request as addOrganizationQueryBody;
                const { city, name } = params;
                SQLquery = `INSERT INTO organiztions
                (city, name)
                VALUES (?, ?)`;
                SQLparams = [city, name];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'contract':
            {
                const { params } = request as addContractQueryBody;
                const { date, number, organizationID } = params;
                SQLquery = `INSERT INTO contracts
                (number, "date", organiztion_id) 
                VALUES (?, ?, ?)`;
                SQLparams = [number, date, organizationID];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'repairDevice':
            {
                const { params } = request as addRepairDeviceQueryBody;
                const { contractID, deviceID, serialNumber, unitContractJSON } =
                    params;
                let { repairNumber } = params;
                if (!repairNumber) {
                    repairNumber =
                        (await new Promise((resolve, reject) => {
                            const SQLquery = `SELECT repair_devices.repair_number AS repairNumbers
                    FROM repair_devices
                    WHERE repair_devices.contract_id = ? AND repair_devices.device_id = ?
                    ORDER BY repair_devices.repair_number ASC`;
                            ResDBAll<{ repairNumbers: number }[]>(SQLquery, [
                                contractID,
                                deviceID,
                            ])
                                .catch((error) => sendError(error))
                                .then((result) => {
                                    for (let { repairNumbers } of result as {
                                        repairNumbers: number;
                                    }[]) {
                                        let freeNumber = 1;
                                        if (freeNumber === repairNumbers) {
                                            freeNumber++;
                                        } else resolve(freeNumber);
                                    }
                                });
                        })) || 0;
                }
                SQLquery = `INSERT INTO repair_devices (contract_id, device_id, create_time, change_time, divided, repair_number, unit_contracts_json, serial_number) 
            VALUES (?, ?, ?, ?, 0, ?, ?, ?)`;
                SQLparams = [
                    contractID,
                    deviceID,
                    changeTime,
                    changeTime,
                    repairNumber,
                    unitContractJSON,
                    serialNumber,
                ];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'note':
            {
                const { params } = request as addNewRepairNoteQueryBody;
                const { repairDeviceID, text } = params;
                SQLquery = `INSERT INTO repair_notes ("text", "date", repair_device_id) VALUES (?, ?, ?)`;
                SQLparams = [text, changeTime, repairDeviceID];
                ResDBRun(SQLquery, SQLparams)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'repairBlock':
            {
                const { params } = request as addRepairBlockBoyQuery;
                const { blockID, count, repairDeviceID, serialNumber } = params;
                SQLquery = `INSERT INTO repair_blocks (block_id, serial_number, "count", repair_device_id) VALUES (${blockID}, "${serialNumber}", ${count}, ${repairDeviceID});
                UPDATE repair_devices SET change_time = ${changeTime} WHERE repair_devices.id = (
                            SELECT repair_blocks.repair_device_id
                            FROM repair_blocks
                            WHERE repair_blocks.id = (SELECT last_insert_rowid() AS id)
                        )`;
                SQLparams = [];
                ResDBExec(SQLquery)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'defectToBlock':
            {
                const { params } = request as addDefectToBlockQueryBody;
                const { defectID, repairBlockID } = params;
                SQLquery = `INSERT INTO defects_in_repair (repair_blocks_id, defect_id) VALUES (${repairBlockID}, ${defectID});
                UPDATE repair_devices SET change_time = ${changeTime} WHERE repair_devices.id = (
                    SELECT repair_blocks.repair_device_id
                    FROM repair_blocks
                    WHERE repair_blocks.id = (SELECT repair_blocks.id FROM repair_blocks WHERE repair_blocks.id = ${repairBlockID})
                )`;
                SQLparams = [];
                ResDBExec(SQLquery)
                    .catch((error) => sendError(error))
                    .then((result) => {});
            }
            break;

        case 'copyDefect': {
            const { params } = request as copyDefect;
            const { defectID } = params;

            interface Idefect {
                id: number;
                description: string;
                defect: string;
                solution: string;
                blockID: number;
            }
            const getDefectSQL = `SELECT defects.id,
            defects.description,
            defects.defect,
            defects.solution,
            defects.block_id AS "blockID"
            FROM defects
            WHERE defects.id = ?`;

            interface Iaction {
                id: number;
                index: string;
                action: string;
            }
            const getActionsSQL = `SELECT actions.id,
            actions."action",
            actions."index"
            FROM actions
            WHERE actions.defect_id = ?`;

            interface Imaterial {
                actionID: number;
                materialID: number;
                count: number;
            }
            const getMaterialsSQL = `SELECT materials_in_actions.count,
            materials_in_actions.material_id,
            materials_in_actions.action_id
            FROM actions 
            JOIN materials_in_actions ON actions.id = materials_in_actions.action_id
            WHERE actions.defect_id = ?`;

            const addDefectSQL = `INSERT INTO defects (description, defect, solution, block_id) VALUES (?, ?, ?, ?)`;
            const addActionSQL = `INSERT INTO actions ("action", "index", defect_id) VALUES (?, ?, ?)`;
            const addMaterialSQL = `INSERT INTO materials_in_actions (material_id, action_id, "count") VALUES (?, ?, ?)`;

            const Adefect = ResDBAll<[Idefect]>(getDefectSQL, [defectID]);
            const actions = ResDBAll<Iaction[]>(getActionsSQL, [defectID]);
            const materials = ResDBAll<Imaterial[]>(getMaterialsSQL, [
                defectID,
            ]);

            Promise.all([Adefect, actions, materials]).then((result) => {
                ResDB.database?.serialize(async () => {
                    await ResDBRun('BEGIN TRANSACTION', []);
                    const [[defect], actions, materials] = result;
                    const addedDefect = await ResDBRun(addDefectSQL, [
                        defect.description,
                        defect.defect,
                        defect.solution,
                        defect.blockID,
                    ]);
                    const newDefectID = addedDefect.lastID;

                    for (let Action of actions) {
                        const { action, index } = Action;
                        const addedAction = await ResDBRun(addActionSQL, [
                            action,
                            index,
                            newDefectID,
                        ]);
                        const newActionID = addedAction.lastID;
                        for (let Material of materials) {
                            if (Action.id !== Material.actionID) continue;
                            await ResDBRun(addMaterialSQL, [
                                Material.materialID,
                                newActionID,
                                Material.count,
                            ]);
                        }
                    }
                    ResDBRun('COMMIT', []);
                });
            });
            break;
        }

        case 'existAction':
            {
                const { params } = request as addExitActionQueryBody;
                const { actionID, defectID } = params;
                const getActionSQLquery = `SELECT * FROM actions WHERE actions.id = ?`;
                const getActionMaterialsSQLquery = `SELECT * FROM materials_in_actions WHERE materials_in_actions.action_id = ?`;

                const [copiedAction] = await ResDBAll<[actionSQL]>(
                    getActionSQLquery,
                    [actionID]
                );
                const copiedMaterials = await ResDBAll<materialsInActionsSQL[]>(
                    getActionMaterialsSQLquery,
                    [actionID]
                );

                const { action, index } = copiedAction;
                const addNewActionSQL = `INSERT INTO actions ("action", "index", "defect_id") VALUES (?, ?, ?)`;
                const lastInsertedIDSQL = `SELECT last_insert_rowid() as newActionID`;
                await ResDBRun(addNewActionSQL, [action, index, defectID]);
                const [{ newActionID }] = await ResDBAll<
                    [{ newActionID: number }]
                >(lastInsertedIDSQL, []);

                const addMaterialSQL = `INSERT INTO materials_in_actions (material_id, action_id, "count") VALUES (?, ?, ?)`;
                copiedMaterials.forEach((Material) => {
                    ResDBRun(addMaterialSQL, [
                        Material.material_id,
                        newActionID,
                        Material.count,
                    ]);
                });
            }
            break;

        case 'user': {
            if (user?.roots !== 'admin') {
                sendError(
                    {},
                    'Недостаточно прав для добавления нового пользователя'
                );
                return;
            }
            const { params } = request as addUserQueryBody;
            const { login, password, roots } = params;
            const passwordHash = SHA256(password).toString();
            SQLquery = `INSERT INTO users (login, password_hash, roots) VALUES (?, ?, ?)`;
            SQLparams = [login, passwordHash, roots];
            AuthDBRun(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => {});
            break;
        }

        default:
            break;
    }
}
