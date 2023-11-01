import {
    fileAvailable,
    folderExists,
    getErrorSender,
    getResponseSender,
} from '@src/globalFunctions';
import { WebSocket } from 'ws';
import { WebSocketRequerst } from './server';
import { authResult, roots } from './authorization';
import { settings } from './settings';
import path from 'path';
import { DB } from './classes';
import { mkdirSync, readdirSync } from 'fs-extra';

export type menuContractItem = {
    id: number;
    number: string;
    name: string;
};

export type defectTableRow = {
    id: number;
    name: string;
    decimal: string;
    description: string;
};

export type defectForDescription = {
    id: number;
    name: string;
    decimal: string;
    description: string;
    defect: string;
    solution: string;
    block_id: number;
};

export type blockToSelect = {
    block_id: number;
    name: string;
    decimal: string;
    is_leading: number | null;
};

export type defectAction = {
    id: number;
    index: string;
    action: string;
};

export type actionMaterial = {
    action_id: number;
    material_id: number;
    name: string;
    count: number;
    unit: string;
};

export type unit = {
    unit: string;
};

export type material = {
    id: number;
    name: string;
    unit: string;
    meta: string;
};

export type actionForAutoComplite = {
    value: string;
    label: string;
    key: number;
};

export type existAction = {
    value: string;
    label: string;
    key: number;
};

export type device = {
    id: number;
    name: string;
    decimal: string;
};

export type contractHead = {
    number: string;
    date: string;
    organization_name: string;
};

export type contractDevices = {
    id: number;
    repair_number: number;
    name: string;
    decimal: string;
    serial_number: string;
    createTime: number;
    unit_contracts_json: string | null;
};

export type block = {
    id: number;
    name: string;
    decimal: string;
};

export type repairNote = {
    id: number;
    text: string;
    date: number;
};

export type docsStatus = {
    deviceID: number;
    deviceName: string;
    repairNumber: number;
    serialNumber: string;
    defectBlank: boolean;
    defectDocument: boolean;
    actionBlank: boolean;
    actionDocumnet: boolean;
};

export type selectOption = {
    label: string;
    value: number;
};

export type repairBlockForTable = {
    id: number;
    name: string;
    decimal: string;
    count: number;
    serialNumber: string;
};

export type repairTimes = {
    changeTime: number;
    createTime: number;
};

export type blockDefect = {
    id: number;
    description: string;
};

type defectMain = {
    id: number;
    description: string;
    defect: string;
    solution: string;
};

type action = {
    id: number;
    action: string;
    index: string;
};

type materialForAction = {
    name: string;
    count: number;
    unit: string;
    actionID: number;
};

export type organiztion = {
    id: number;
    name: string;
    city: string;
};

export type contract = {
    id: number;
    number: string;
    date: string;
    organization_ID: number;
};

export type city = {
    city: string;
};

export type user = {
    login: string;
    roots: roots;
};

export type searchedRepair = {
    organizationName: string;
    contractNumber: string;
    deviceName: string;
    deviceDecimal: string;
    repairNumber: number;
    deviceSerialNumber: string;
    blockName: string;
    blockDecimal: string;
    blockSerialNumber: string;
    isLeading: 1 | null;
};

export interface searchingRepair {
    type: 'get';
    url: 'searchingRepair';
    targetID: string;
}

export type defectDetails = [[defectMain], action[], materialForAction[]];

export type addDefectData = { value: number; label: string };

export async function GEThandlers(
    socket: WebSocket,
    ResDB: DB,
    authDB: DB,
    request: WebSocketRequerst,
    user: authResult['user']
) {
    const sendResponse = getResponseSender(socket);
    const sendError = getErrorSender(socket);
    const ResDBAll = ResDB.getDBAll();
    const AuthDBAll = authDB.getDBAll();

    const { url } = request;

    let SQLquery: string = '';
    let SQLparams: (string | number)[] | [] = [];

    switch (url) {
        // Главное меню
        case 'mainMenu': {
            SQLquery = `SELECT contracts.id, contracts.number, organiztions.name
            FROM contracts
            JOIN organiztions ON contracts.organiztion_id = organiztions.id`;
            ResDBAll<menuContractItem[]>(SQLquery, [])
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Организации
        case 'organizations': {
            SQLquery = 'SELECT * FROM organiztions';
            ResDBAll<organiztion[]>(SQLquery, [])
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Контракты
        case 'contracts': {
            const organizationID = request.targetID as number;
            SQLquery = `SELECT * 
            FROM contracts
            WHERE contracts.organiztion_id = ?`;
            SQLparams = [organizationID];
            ResDBAll<contract[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Таблица дефектов в БД дефектов
        case 'defectsForTable': {
            SQLquery = `SELECT defects.id, blocks.name, defects.description, blocks.decimal
            FROM defects
            JOIN blocks ON defects.block_id = blocks.id`;
            SQLparams = [];
            ResDBAll<defectTableRow[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Подробные данные о дефекте для БД дефектов
        case 'defectDetails': {
            const defectID = request.targetID as number;
            SQLquery = `SELECT defects.id, blocks.name, blocks.decimal, defects.description, defects.defect, defects.solution, defects.block_id
            FROM defects
            JOIN blocks ON defects.block_id = blocks.id 
            WHERE defects.id = ?`;
            SQLparams = [defectID];
            ResDBAll<[defectForDescription]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Блоки для выбора
        case 'blocksForSelect': {
            SQLquery = `SELECT blocks_in_devices.block_id, blocks.name, blocks.decimal, blocks.is_leading
            FROM blocks_in_devices
            JOIN blocks ON blocks_in_devices.block_id = blocks.id
            ORDER BY blocks_in_devices.device_id`;
            SQLparams = [];
            ResDBAll<blockToSelect[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Действия из неисправности для БД неисправностей
        case 'actionsFormDefect': {
            const defectID = request.targetID as number;
            SQLquery = `SELECT actions.id, actions."index", actions.action
            FROM actions
            WHERE actions.defect_id = ?
            ORDER BY actions."index" ASC;`;
            SQLparams = [defectID];
            ResDBAll<defectAction[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Материалы для действия для БД неисправностей
        case 'actionMaterials': {
            const actionID = request.targetID as number;
            SQLquery = `SELECT materials_in_actions.action_id, materials_in_actions.material_id, materials."name", materials_in_actions."count", materials."unit"
            FROM materials_in_actions
            JOIN materials ON materials_in_actions.material_id = materials.id
            WHERE materials_in_actions.action_id = ?`;
            SQLparams = [actionID];
            ResDBAll<actionMaterial[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Единицы измерения материалов
        case 'materialUnits': {
            SQLquery = `SELECT DISTINCT unit FROM materials`;
            SQLparams = [];
            ResDBAll<unit[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Все города в БД организаций
        case 'cities': {
            SQLquery = `SELECT DISTINCT organiztions.city
            FROM organiztions`;
            ResDBAll<city[]>(SQLquery, [])
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
        }

        // Все материалы из базы данных
        case 'materials': {
            SQLquery = `SELECT *
            FROM materials
            ORDER BY name;`;
            SQLparams = [];
            ResDBAll<material[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Действия относящиеся к блоку для автокомплита
        case 'blockActions': {
            const defectID = request.targetID as number;
            SQLquery = `SELECT DISTINCT actions."action" AS "value"
            FROM defects
            JOIN actions ON defects.id = actions.defect_id
            WHERE defects.block_id = (SELECT defects.block_id FROM defects WHERE defects.id = ?)
            ORDER BY actions."index" ASC`;
            SQLparams = [defectID];
            ResDBAll<{ value: string }[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Действия относящихся к блоку для добавления существующих действий
        case 'existBlockActions': {
            const defectID = request.targetID as number;
            SQLquery = `SELECT actions."index" || ": " || actions.action AS "label", actions."index" || ": " || actions.action AS "value", actions.id AS "key"
            FROM actions
            JOIN defects ON defects.id = actions.defect_id
            WHERE defects.block_id = (SELECT DISTINCT defects.block_id FROM defects WHERE defects.id = ?)
            GROUP BY label
            ORDER BY actions."index" ASC;`;
            SQLparams = [defectID];
            ResDBAll<existAction[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Все устройства в БД
        case 'devices': {
            SQLquery = `SELECT devices.id, devices.name, devices.decimal FROM devices`;
            SQLparams = [];
            ResDBAll<device[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Данные о контракте
        case 'contractHead': {
            const contractID = request.targetID as number;
            SQLquery = `SELECT contracts.number, contracts."date", organiztions.name AS "organization_name"
            FROM contracts
            JOIN organiztions ON contracts.organiztion_id = organiztions.id
            WHERE contracts.id = ?`;
            SQLparams = [contractID];
            ResDBAll<contractHead[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) =>
                    sendResponse((result as contractHead[])[0], request)
                );
            break;
        }

        // Устройства в контракте
        case 'contractDevices': {
            const contractID = request.targetID as number;
            SQLquery = `SELECT repair_devices.id, 
            repair_devices.repair_number, 
            devices.name, 
            devices.decimal,
            repair_devices.unit_contracts_json,
            repair_devices.serial_number,
            repair_devices.create_time AS "createTime"
            FROM repair_devices
            JOIN devices ON repair_devices.device_id = devices.id
            WHERE repair_devices.contract_id = ?`;
            SQLparams = [contractID];
            ResDBAll<contractDevices[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Блоки относящиеся к устройству
        case 'deviceBlocks': {
            const deviceID = request.targetID as number;
            SQLquery = `SELECT blocks.id, blocks.name, blocks.decimal
            FROM blocks
            JOIN blocks_in_devices ON blocks.id = blocks_in_devices.block_id
            WHERE blocks_in_devices.device_id = (SELECT repair_devices.device_id FROM repair_devices WHERE repair_devices.id = ?)
            ORDER BY blocks.is_leading DESC, blocks.id ASC`;
            SQLparams = [deviceID];
            ResDBAll<block[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        case 'searchingRepair': {
            const { targetID } = request as searchingRepair;
            const SQLquery = `SELECT organiztions.name AS "organizationName",
            contracts.number AS "contractNumber",
            devices.name AS "deviceName",
            devices.decimal AS "deviceDecimal",
            repair_devices.repair_number AS "repairNumber",
            repair_devices.serial_number AS "deviceSerialNumber",
            blocks.name AS "blockName",
            blocks.decimal AS "blockDecimal",
            repair_blocks.serial_number AS "blockSerialNumber",
            blocks.is_leading AS "isLeading"
            FROM repair_devices
            JOIN repair_blocks ON repair_blocks.repair_device_id = repair_devices.id
            JOIN contracts ON repair_devices.contract_id = contracts.id
            JOIN organiztions ON contracts.organiztion_id = organiztions.id
            JOIN devices ON devices.id = repair_devices.device_id
            JOIN blocks ON blocks.id = repair_blocks.block_id
            WHERE repair_devices.serial_number = ? OR repair_blocks.serial_number = ?
            ORDER BY blocks.is_leading DESC`;
            ResDBAll<searchedRepair[]>(SQLquery, [targetID, targetID])
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Примечания к устройству в ремонте
        case 'repairDeviceNotes': {
            const repairDeviceID = request.targetID as number;
            SQLquery = `SELECT repair_notes.id, repair_notes."text", repair_notes."date"
            FROM repair_notes
            WHERE repair_notes.repair_device_id = ?`;
            SQLparams = [repairDeviceID];
            ResDBAll<repairNote[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Данные для select для добавления блока в ремонт
        case 'blocksForRepairSelect': {
            const repairDeviceID = request.targetID as number;
            SQLquery = `SELECT name AS "label", id AS "value"
            FROM blocks_in_devices
            JOIN blocks ON blocks.id = blocks_in_devices.block_id
            WHERE device_id = (SELECT device_id
            FROM repair_blocks
            JOIN repair_devices ON repair_devices.id = repair_blocks.repair_device_id
            WHERE repair_blocks.id = ?);`;
            SQLparams = [repairDeviceID];
            ResDBAll<selectOption[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Блоки в ремонте, относящиеся к устройству в ремонте
        case 'repairBlocksInRepairDevice': {
            const repairDeviceID = request.targetID as number;
            SQLquery = `SELECT repair_blocks.id, name, decimal, "count", serial_number AS serialNumber
            FROM repair_blocks
            JOIN blocks ON blocks.id = repair_blocks.block_id
            WHERE repair_blocks.repair_device_id = ?`;
            SQLparams = [repairDeviceID];
            ResDBAll<repairBlockForTable[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Divided ?
        case 'isDivided': {
            const repairDeviceID = request.targetID as number;
            SQLquery = `SELECT divided
            FROM repair_devices
            WHERE repair_devices.id = ?`;
            SQLparams = [repairDeviceID];
            ResDBAll<[{ divided: boolean }]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) =>
                    sendResponse(
                        (result as [{ divided: boolean }])[0].divided,
                        request
                    )
                );
            break;
        }

        // Время создания и изменения устройства
        case 'repairDeviceTimes': {
            const repairDeviceID = request.targetID as number;
            SQLquery = `SELECT repair_devices.change_time AS changeTime, repair_devices.create_time AS createTime
            FROM repair_devices
            WHERE repair_devices.id = ?`;
            SQLparams = [repairDeviceID];
            ResDBAll<[repairTimes]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Дефекты в ремонтируемом блоке
        case 'repairBlockDefects': {
            const repairBlockID = request.targetID as number;
            SQLquery = `SELECT defects.id AS "id", defects.description AS description
            FROM defects_in_repair
            JOIN defects ON defects.id = defects_in_repair.defect_id
            WHERE defects_in_repair.repair_blocks_id=?`;
            SQLparams = [repairBlockID];
            ResDBAll<blockDefect[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Детализация дефетка
        case 'defectDetailsForRepair': {
            const defectID = request.targetID as number;
            const getDefectDetailsSQL = `SELECT *
            FROM defects
            WHERE defects.id = ?;`;

            const getDefectActionsSQL = `SELECT *
            FROM actions
            WHERE actions.defect_id = ?;`;

            const getDefectMaterialsSQL = `SELECT materials.name, materials_in_actions."count", materials.unit, actions.id	AS actionID
            FROM materials_in_actions 
            JOIN materials ON materials.id = materials_in_actions.material_id
            JOIN actions ON actions.id = materials_in_actions.action_id
            WHERE actions.defect_id = ?;`;

            const defectPromise = ResDBAll<[defectMain]>(getDefectDetailsSQL, [
                defectID,
            ]);
            const actionsPromise = ResDBAll<action[]>(getDefectActionsSQL, [
                defectID,
            ]);
            const materialsPromise = ResDBAll<materialForAction[]>(
                getDefectMaterialsSQL,
                [defectID]
            );

            Promise.all([defectPromise, actionsPromise, materialsPromise])
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Неисправности доступные для добавления в ремонтируемый блок
        case 'defectsAllowedToAdd': {
            const repairBlockID = request.targetID as number;
            SQLquery = `SELECT id AS value, description AS label
            FROM defects
            WHERE defects.block_id = (
                SELECT block_id
                FROM repair_blocks
                WHERE repair_blocks.id = ? AND defects.id NOT IN (
                    SELECT defect_id AS id
                    FROM defects_in_repair
                    WHERE defects_in_repair.repair_blocks_id = ?
                ))
            ORDER BY label;`;
            SQLparams = [repairBlockID, repairBlockID];
            ResDBAll<addDefectData[]>(SQLquery, SQLparams)
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Доступность бланков и готовых документов
        case 'blanksAndDocsStatus': {
            const repairDeviceID = request.targetID as number;
            SQLquery = `SELECT devices.name AS "deviceName",
            repair_devices.contract_id AS "contractID",
            repair_devices.repair_number AS "repairNumber",
            repair_devices.serial_number AS "serialNumber",
            repair_devices.device_id AS "deviceID"
            FROM repair_devices
            JOIN devices ON devices.id = repair_devices.device_id
            WHERE repair_devices.id = ?`;
            interface deviceFileInfo {
                deviceName: string;
                deviceID: number;
                contractID: number;
                repairNumber: number;
                serialNumber: string;
            }
            const [
                {
                    deviceName,
                    contractID,
                    repairNumber,
                    serialNumber,
                    deviceID,
                },
            ] = await ResDBAll<[deviceFileInfo]>(SQLquery, [repairDeviceID]);
            const { blanksFolerPath, documentsFolderPath } = settings;
            const actionBlankPath = path.join(
                blanksFolerPath,
                contractID.toString(),
                `${deviceID}_actionBlank.xlsx`
            );
            const defectBlankPath = path.join(
                blanksFolerPath,
                contractID.toString(),
                `${deviceID}_defectBlank.xlsx`
            );
            const actionListPath = path.join(
                documentsFolderPath,
                contractID.toString(),
                `Перечни выполненых работ`,
                `${deviceName} - №${repairNumber} ${serialNumber}.xlsx`
            );
            const defectListPath = path.join(
                documentsFolderPath,
                contractID.toString(),
                'Карты дефектации',
                `${deviceName} - №${repairNumber} ${serialNumber}.xlsx`
            );
            const docsStatus: docsStatus = {
                deviceID: deviceID,
                deviceName: deviceName,
                repairNumber: repairNumber,
                serialNumber: serialNumber,
                actionBlank: fileAvailable(actionBlankPath),
                actionDocumnet: fileAvailable(actionListPath),
                defectBlank: fileAvailable(defectBlankPath),
                defectDocument: fileAvailable(defectListPath),
            };
            sendResponse(docsStatus, request);
            break;
        }

        // Получение списка файлов, относящихся к у-ву или контракту
        case 'filesList': {
            const typeFolder = {
                note: 'Описи',
                mail: 'Письма',
                contract: 'Контракт',
                photo: 'Фото',
            };
            const targetIDs = request.targetID as string;
            const [type, contractID, repairDeviceID] = targetIDs.split('|') as [
                'note' | 'mail' | 'contract' | 'photo',
                string,
                string,
            ];
            const { documentsFolderPath } = settings;
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
            ].forEach((folder) => {
                if (!folderExists(folder)) {
                    mkdirSync(folder);
                }
            });
            const folderPath =
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
            try {
                const result = readdirSync(folderPath);
                sendResponse(result, request);
            } catch (error) {
                console.log(error);
            }
        }

        // Получение данных о настройках сервера
        case 'serverSettings': {
            if (user?.roots !== 'admin') {
                sendError(
                    {},
                    'Недостаточно прав для получения информации о настройках'
                );
                return;
            }
            sendResponse(settings, request);
            break;
        }

        // Получение всех пользователей
        case 'users': {
            if (user?.roots !== 'admin') {
                sendError(
                    {},
                    'Недостаточно прав для получения информации о пользователях'
                );
                return;
            }
            SQLquery = 'SELECT login, roots FROM users';
            AuthDBAll<user[]>(SQLquery, [])
                .catch((error) => sendError(error))
                .then((result) => sendResponse(result, request));
            break;
        }

        // Получение существующих бэкапов
        case 'backUPS': {
            if (user?.roots !== 'admin') {
                sendError(
                    {},
                    'Недостаточно прав для получения информации о бэкапах'
                );
                return;
            }
            if (!folderExists(settings.backUpsFolderPath))
                mkdirSync(settings.backUpsFolderPath);
            const backUps = readdirSync(settings.backUpsFolderPath, {
                withFileTypes: true,
            })
                .filter((File) => {
                    if (File.isDirectory()) return false;
                    if (File.name.endsWith('.db')) return true;
                    return false;
                })
                .map((File) => {
                    return { name: File.name };
                });
            sendResponse(backUps, request);
            break;
        }

        // case "":
        //     SQLquery = ``;
        //     SQLparams = [];
        //     ResDBAll<>(SQLquery, SQLparams)
        //         .catch((error) => sendError(error))
        //         .then((result) => sendResponse(result, request));
        //     break;
        default:
            break;
    }
}
