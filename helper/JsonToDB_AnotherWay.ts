const path = require('path');
import { sqlite3 } from 'sqlite3';
const sqlite: sqlite3 = require('sqlite3');
const fs = require('fs');

function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}.${minutes}.${seconds}`;
}

console.log(getCurrentDateTime());
const dbPath = path.resolve(
    __dirname,
    `dataBases`,
    `NWR ${getCurrentDateTime()}.db`
);
interface idsObject {
    [key: string]: number;
    count: number;
}
let materialsIDs: idsObject = {
    count: 0,
};
let devicesIDs: idsObject = {
    count: 0,
};
let blocksIDs: idsObject = {
    count: 0,
};
let defectsIDs: idsObject = {
    count: 0,
};
let actionsIDs: idsObject = {
    count: 0,
};
let noteID = -1;
let organiztionsIDs = [
    {
        name: '144 БТРЗ',
        city: 'Екатеринбург',
    },
    {
        name: '61 БТРЗ',
        city: 'Санкт-Петербург',
    },
    {
        name: '81 БТРЗ',
        city: 'Армавир',
    },
];
let contractsIDs: idsObject = {
    count: 0,
};
let repairDevicesIDs: idsObject = {
    count: 0,
};
let repairBlocksIDs: idsObject = {
    count: 0,
};

const contractsPath: string = path.join(__dirname, `dataBases/contracts.json`);
const defectsPath: string = path.join(__dirname, `dataBases/defectsBase.json`);
const devicesPath: string = path.join(__dirname, `dataBases/devicesBase.json`);
const materialsPath: string = path.join(
    __dirname,
    `dataBases/materialsBase.json`
);

const JSONdatabse: dataBaseJSON = {
    contracts: JSON.parse(fs.readFileSync(contractsPath, 'utf-8')),
    defects: JSON.parse(fs.readFileSync(defectsPath, `utf-8`)),
    devices: JSON.parse(fs.readFileSync(devicesPath, `utf-8`)),
    materials: JSON.parse(fs.readFileSync(materialsPath, `utf-8`)),
};

let db = new sqlite.Database(dbPath);

let SQLbigQuery = '';
// Создание БД материалов
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "materials" (
    "id" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "meta" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
);\n`;
// Заполнение БД материалов
JSONdatabse.materials.forEach((material) => {
    const { name, key, unit } = material;
    let materialID: number | undefined;
    if (materialsIDs.hasOwnProperty(key)) {
        materialID = materialsIDs[key];
    } else {
        materialsIDs[key] = materialsIDs.count;
        materialID = materialsIDs.count;
        materialsIDs.count++;
    }
    SQLbigQuery =
        SQLbigQuery +
        `INSERT INTO materials (id, name, unit) VALUES (${materialID}, "${name.replace(
            `"`,
            `'`
        )}", "${unit}");\n`;
});

// Создание БД устройств
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "devices" (
    "id" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "decimal" TEXT NOT NULL,
    "meta" TEXT,
    PRIMARY KEY ("id" AUTOINCREMENT)
);\n`;

// Создание БД блоков
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "blocks" (
    "id" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "decimal" TEXT NOT NULL,
    "is_leading" INTEGER,
    "meta" TEXT,
    PRIMARY KEY ("id" AUTOINCREMENT)
);\n`;
// Создание таблицы связей ИЗДЕЛИЕ - БЛОК
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE blocks_in_devices ("device_id" INTEGER NOT NULL,"block_id" INTEGER NOT NULL, PRIMARY KEY (device_id, block_id),FOREIGN KEY (device_id) REFERENCES devices(id), FOREIGN KEY (block_id) REFERENCES blocks(id));\n`;

// Заполнение БД устройств
JSONdatabse.devices.forEach((device) => {
    const { key, name, decimal } = device;
    let deviceID: undefined | number;
    if (devicesIDs.hasOwnProperty(key)) {
        deviceID = devicesIDs[key];
    } else {
        devicesIDs[key] = devicesIDs.count;
        deviceID = devicesIDs.count;
        devicesIDs.count++;
    }
    SQLbigQuery =
        SQLbigQuery +
        `INSERT INTO devices (id, name, decimal) VALUES (${deviceID}, "${name}", "${decimal}");\n`;

    // Добавляем это же устройство как блок
    let deviceBlockID: number | undefined;
    blocksIDs[key] = blocksIDs.count;
    deviceBlockID = blocksIDs.count;
    blocksIDs.count++;

    SQLbigQuery =
        SQLbigQuery +
        `INSERT INTO blocks (id, name, decimal, is_leading) VALUES (${deviceBlockID}, "${name}", "${decimal}", 1);\n`;

    // Создаем связь
    SQLbigQuery =
        SQLbigQuery +
        `INSERT INTO blocks_in_devices (device_id, block_id) VALUES (${deviceID}, ${deviceBlockID});\n`;

    // Заполняем базу блоков
    device.includes.forEach((block) => {
        const { key, name, decimal } = block;
        let blockID: undefined | number;
        if (blocksIDs.hasOwnProperty(key)) {
            blockID = blocksIDs[key];
            SQLbigQuery =
                SQLbigQuery +
                `INSERT INTO blocks_in_devices (device_id, block_id) VALUES (${deviceID}, ${blockID});\n`;
        } else {
            blocksIDs[key] = blocksIDs.count;
            blockID = blocksIDs.count;
            blocksIDs.count++;
            SQLbigQuery =
                SQLbigQuery +
                `INSERT INTO blocks (id, name, decimal) VALUES (${blockID}, "${name}", "${decimal}");\n`;
            SQLbigQuery =
                SQLbigQuery +
                `INSERT INTO blocks_in_devices (device_id, block_id) VALUES (${deviceID}, ${blockID});\n`;
        }
    });
});

// Создание БД неисправностей
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE defects (
    "id" INTEGER NOT NULL UNIQUE, 
    "description" TEXT NOT NULL, 
    "defect" TEXT, 
    "solution" TEXT, 
    "block_id" INTEGER NOT NULL, 
    "meta" TEXT, 
    FOREIGN KEY (block_id) REFERENCES blocks(id), 
    PRIMARY KEY ("id" AUTOINCREMENT)
);\n`;

// Создание БД действий
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE actions (
    "id" INTEGER NOT NULL UNIQUE, 
    "action" TEXT NOT NULL, 
    "index" TEXT NOT NULL, 
    "defect_id" INTEGER NOT NULL, 
    "meta" TEXT, FOREIGN KEY (defect_id) REFERENCES defects(id), 
    PRIMARY KEY ("id" AUTOINCREMENT)
);\n`;

// Создание таблицы связей ДЕЙСТВИЕ - МАТЕРИАЛЫ
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE materials_in_actions (
    "action_id" INTEGER NOT NULL, 
    "material_id" INTEGER NOT NULL, 
    "count" FLOAT NOT NULL, 
    PRIMARY KEY (action_id, material_id), 
    FOREIGN KEY (action_id) REFERENCES actions(id), 
    FOREIGN KEY (material_id) REFERENCES materials(id)
);\n`;

// Заполнение таблицы дефектов
JSONdatabse.defects.forEach((Defect) => {
    const { deviceKey, description, defect, solution, actions } = Defect;
    const defectKey = Defect.key;
    let defectID: undefined | number;
    const blockID = blocksIDs[deviceKey];
    if (defectsIDs.hasOwnProperty(defectKey)) {
        defectID = defectsIDs[defectKey];
    } else {
        defectsIDs[defectKey] = defectsIDs.count;
        defectID = defectsIDs.count;
        defectsIDs.count++;
    }

    // Добавляем неисправность
    (SQLbigQuery =
        SQLbigQuery +
        `INSERT INTO defects (id, description, defect, solution, block_id) VALUES (${defectID}, "${description}", "${defect}", "${solution}", ${blockID});\n`),
        // Добавляем действия к неисправности
        actions.forEach((Action) => {
            const { index, action, materials } = Action;
            const actionKey = Action.key;
            let actionID: undefined | number;
            if (actionsIDs.hasOwnProperty(actionKey)) {
                actionID = actionsIDs[actionKey];
            } else {
                actionsIDs[actionKey] = actionsIDs.count;
                actionID = actionsIDs.count;
                actionsIDs.count++;
            }

            SQLbigQuery =
                SQLbigQuery +
                `INSERT INTO actions ("id", "action", "index", "defect_id") VALUES (${actionID}, "${action}", "${index}", ${defectID});\n`;

            materials.forEach((Material) => {
                const { count, materialKey, key } = Material;
                const materialID = materialsIDs[materialKey];
                SQLbigQuery =
                    SQLbigQuery +
                    `INSERT INTO materials_in_actions (action_id, material_id, count) VALUES (${actionID}, ${materialID}, ${count});\n`;
            });
        });
});

// Создание БД организаций
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "organiztions" (
    "id" INTEGER NOT NULL UNIQUE, 
    "name" TEXT NOT NULL, 
    "city" TEXT NOT NULL, 
    "meta" TEXT, 
    PRIMARY KEY("id" AUTOINCREMENT)
);\n`;

// Создание БД контрактов
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "contracts" (
    "id" INTEGER NOT NULL UNIQUE, 
    "number" TEXT NOT NULL, 
    "date" TEXT NOT NULL, 
    "organiztion_id" INTEGER, 
    "meta" TEXT, 
    PRIMARY KEY("id" AUTOINCREMENT), 
    FOREIGN KEY (organiztion_id) REFERENCES organiztions(id)
);\n`;

// Создание БД устройств в ремонте
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "repair_devices" (
    "id" INTEGER NOT NULL UNIQUE,
    "contract_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "create_time" INTEGER NOT NULL,
    "change_time" INTEGER NOT NULL,
    "repair_number" INTEGER NOT NULL,
    "serial_number" TEXT NOT NULL,
    "divided"   INTEGER NOT NULL,
    "meta" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY ("contract_id") REFERENCES contracts(id),
    FOREIGN KEY ("device_id") REFERENCES defects(id)
);\n`;

// Создание БД примечаний
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE repair_notes (
    "id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "date" INTEGER NOT NULL,
    "repair_device_id" INTEGER NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY ("repair_device_id") REFERENCES repair_devices("id")
);\n`;

// Создание БД блоков в ремонте
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "repair_blocks" (
    "id"	INTEGER NOT NULL UNIQUE,
    "block_id"	INTEGER NOT NULL,
    "serial_number"	TEXT NOT NULL,
    "repair_device_id" INTEGER NOT NULL,
    "count"	REAL NOT NULL,
    "meta" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY ("repair_device_id") REFERENCES repair_devices(id),
    FOREIGN KEY ("block_id") REFERENCES blocks(id)
);\n`;

// СОздание таблицы связи БЛОК в ремонте - НЕИСПРАВНОСТЬ
SQLbigQuery =
    SQLbigQuery +
    `CREATE TABLE "defects_in_repair" (
    "repair_blocks_id" INTEGER NOT NULL,
    "defect_id" INTEGER NOT NULL,
    PRIMARY KEY (repair_blocks_id, defect_id),
    FOREIGN KEY (repair_blocks_id) REFERENCES repair_blocks(id),
    FOREIGN KEY (defect_id) REFERENCES defects(id)            
);\n`;

// Заполнение БД организцай
organiztionsIDs.forEach((Organization, id) => {
    const { name, city } = Organization;
    SQLbigQuery =
        SQLbigQuery +
        `INSERT INTO organiztions ("id", "name", "city") VALUES (${id}, "${name}", "${city}");\n`;
});

// Заполнение БД контрактов
JSONdatabse.contracts.forEach((Contract) => {
    const { organizationName, contractDate, contractNumber, repairBase } =
        Contract;
    const ContractKey = Contract.key;
    let contractID: undefined | number;
    if (contractsIDs.hasOwnProperty(ContractKey)) {
        contractID = contractsIDs[ContractKey];
    } else {
        contractsIDs[ContractKey] = contractsIDs.count;
        contractID = contractsIDs.count;
        contractsIDs.count++;
    }
    let organiztionID = organiztionsIDs.findIndex(
        (org) => org.name === organizationName
    );

    SQLbigQuery =
        SQLbigQuery +
        `INSERT INTO contracts ("id", "number", "date", "organiztion_id") VALUES (${contractID}, "${contractNumber}", "${contractDate}", ${organiztionID});\n`;

    // Заполнение БД устройств в ремонте
    repairBase.forEach((RepairDevice) => {
        const {
            changeTime,
            createTime,
            deviceKey,
            repairNumber,
            serialNumber,
            subDevices,
            divided,
        } = RepairDevice;
        const RepairDeviceKey = RepairDevice.key;
        const deviceID = devicesIDs[deviceKey];
        let repairDeviceID: undefined | number;
        if (repairDevicesIDs.hasOwnProperty(RepairDeviceKey)) {
            repairDeviceID = repairDevicesIDs[RepairDeviceKey];
        } else {
            repairDevicesIDs[RepairDeviceKey] = repairDevicesIDs.count;
            repairDeviceID = repairDevicesIDs.count;
            repairDevicesIDs.count++;
        }

        SQLbigQuery =
            SQLbigQuery +
            `INSERT INTO repair_devices ("id", "contract_id", "device_id", "create_time", "change_time", "repair_number", "serial_number", "divided") VALUES (${repairDeviceID}, ${contractID}, ${deviceID}, ${createTime}, ${changeTime}, ${repairNumber}, "${serialNumber}", ${+Boolean(
                divided
            )});\n`;

        // Заполнение базы блоков в ремонте
        RepairDevice.notes.forEach((Note) => {
            const { text, date } = Note;
            noteID++;
            SQLbigQuery =
                SQLbigQuery +
                `INSERT INTO repair_notes ("id", "text", "date", "repair_device_id") VALUES (${noteID}, "${text}", ${date}, ${repairDeviceID});\n`;
        });

        subDevices.forEach((Block) => {
            const { subDeviceKey, serialNumber, count, defects } = Block;
            const blockKey = Block.key;
            const blockID = blocksIDs[subDeviceKey];
            let repairBlockID: undefined | number;
            if (repairBlocksIDs.hasOwnProperty(RepairDeviceKey)) {
                repairBlockID = repairBlocksIDs[subDeviceKey];
            } else {
                repairBlocksIDs[subDeviceKey] = repairBlocksIDs.count;
                repairBlockID = repairBlocksIDs.count;
                repairBlocksIDs.count++;
            }

            SQLbigQuery =
                SQLbigQuery +
                `INSERT INTO repair_blocks ("id", "block_id", "serial_number", "count", "repair_device_id") VALUES (${repairBlockID}, ${blockID}, "${serialNumber}", ${count}, ${repairDeviceID});\n`;

            defects.forEach((Defect) => {
                const defectID = defectsIDs[Defect];

                SQLbigQuery =
                    SQLbigQuery +
                    `INSERT INTO defects_in_repair ("repair_blocks_id", "defect_id") VALUES (${repairBlockID}, ${defectID});\n`;
            });
        });
    });
});
console.log(`Text formed`);
fs.writeFileSync(path.resolve(__dirname, 'SQL.txt'), SQLbigQuery);

db.exec(SQLbigQuery, (error: Error | null) => {
    if (error) {
        console.log(error);
    }
});

export type materialJSON = {
    name: string;
    unit: string;
    key: string;
};
export type materialsJSON = materialJSON[];

// Договоры
export type repairBlockJSON = {
    key: string;
    subDeviceKey: string;
    serialNumber: string;
    parent: string;
    defects: string[];
    count: number;
};
export type repairDeviceJSON = {
    key: string;
    createTime: number;
    changeTime: number;
    deviceKey: string;
    divided: boolean;
    notes: repairNote[];
    repairNumber: number;
    serialNumber: string;
    subDevices: repairBlockJSON[];
};
export type repairNote = {
    key: string;
    text: string;
    date: number;
};
export type contractJSON = {
    organizationName: string;
    contractDate: string;
    contractNumber: string;
    key: string;
    repairBase: repairDeviceJSON[];
};
export type contractsJSON = contractJSON[];

// Дефекты
export type actionMaterialJSON = {
    materialKey: string;
    count: number;
    key: string;
};
export type defectActionJSON = {
    key: string;
    index: string;
    action: string;
    materials: actionMaterialJSON[];
};
export type defectJSON = {
    defect: string;
    solution: string;
    description: string;
    key: string;
    deviceKey: string;
    actions: defectActionJSON[];
};
export type defectsJSON = defectJSON[];

// Устройства
export type blockJSON = {
    name: string;
    decimal: string;
    key: string;
};
export type deviceJSON = blockJSON & {
    includes: blockJSON[];
};
export type devicesJSON = deviceJSON[];

export type dataBaseJSON = {
    contracts: contractsJSON;
    devices: devicesJSON;
    materials: materialsJSON;
    defects: defectsJSON;
};
