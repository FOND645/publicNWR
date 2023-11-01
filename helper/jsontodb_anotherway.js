"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var sqlite = require('sqlite3');
var fs = require('fs');
function getCurrentDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    return "".concat(year, ".").concat(month, ".").concat(day, " ").concat(hours, ".").concat(minutes, ".").concat(seconds);
}
console.log(getCurrentDateTime());
var dbPath = path.resolve(__dirname, "dataBases", "NWR ".concat(getCurrentDateTime(), ".db"));
var materialsIDs = {
    count: 0,
};
var devicesIDs = {
    count: 0,
};
var blocksIDs = {
    count: 0,
};
var defectsIDs = {
    count: 0,
};
var actionsIDs = {
    count: 0,
};
var noteID = -1;
var organiztionsIDs = [
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
var contractsIDs = {
    count: 0,
};
var repairDevicesIDs = {
    count: 0,
};
var repairBlocksIDs = {
    count: 0,
};
var contractsPath = path.join(__dirname, "dataBases/contracts.json");
var defectsPath = path.join(__dirname, "dataBases/defectsBase.json");
var devicesPath = path.join(__dirname, "dataBases/devicesBase.json");
var materialsPath = path.join(__dirname, "dataBases/materialsBase.json");
var JSONdatabse = {
    contracts: JSON.parse(fs.readFileSync(contractsPath, 'utf-8')),
    defects: JSON.parse(fs.readFileSync(defectsPath, "utf-8")),
    devices: JSON.parse(fs.readFileSync(devicesPath, "utf-8")),
    materials: JSON.parse(fs.readFileSync(materialsPath, "utf-8")),
};
var db = new sqlite.Database(dbPath);
var SQLbigQuery = '';
// Создание БД материалов
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"materials\" (\n    \"id\" INTEGER NOT NULL UNIQUE,\n    \"name\" TEXT NOT NULL,\n    \"unit\" TEXT NOT NULL,\n    \"meta\" TEXT,\n    PRIMARY KEY(\"id\" AUTOINCREMENT)\n);\n";
// Заполнение БД материалов
JSONdatabse.materials.forEach(function (material) {
    var name = material.name, key = material.key, unit = material.unit;
    var materialID;
    if (materialsIDs.hasOwnProperty(key)) {
        materialID = materialsIDs[key];
    }
    else {
        materialsIDs[key] = materialsIDs.count;
        materialID = materialsIDs.count;
        materialsIDs.count++;
    }
    SQLbigQuery =
        SQLbigQuery +
            "INSERT INTO materials (id, name, unit) VALUES (".concat(materialID, ", \"").concat(name.replace("\"", "'"), "\", \"").concat(unit, "\");\n");
});
// Создание БД устройств
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"devices\" (\n    \"id\" INTEGER NOT NULL UNIQUE,\n    \"name\" TEXT NOT NULL,\n    \"decimal\" TEXT NOT NULL,\n    \"meta\" TEXT,\n    PRIMARY KEY (\"id\" AUTOINCREMENT)\n);\n";
// Создание БД блоков
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"blocks\" (\n    \"id\" INTEGER NOT NULL UNIQUE,\n    \"name\" TEXT NOT NULL,\n    \"decimal\" TEXT NOT NULL,\n    \"is_leading\" INTEGER,\n    \"meta\" TEXT,\n    PRIMARY KEY (\"id\" AUTOINCREMENT)\n);\n";
// Создание таблицы связей ИЗДЕЛИЕ - БЛОК
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE blocks_in_devices (\"device_id\" INTEGER NOT NULL,\"block_id\" INTEGER NOT NULL, PRIMARY KEY (device_id, block_id),FOREIGN KEY (device_id) REFERENCES devices(id), FOREIGN KEY (block_id) REFERENCES blocks(id));\n";
// Заполнение БД устройств
JSONdatabse.devices.forEach(function (device) {
    var key = device.key, name = device.name, decimal = device.decimal;
    var deviceID;
    if (devicesIDs.hasOwnProperty(key)) {
        deviceID = devicesIDs[key];
    }
    else {
        devicesIDs[key] = devicesIDs.count;
        deviceID = devicesIDs.count;
        devicesIDs.count++;
    }
    SQLbigQuery =
        SQLbigQuery +
            "INSERT INTO devices (id, name, decimal) VALUES (".concat(deviceID, ", \"").concat(name, "\", \"").concat(decimal, "\");\n");
    // Добавляем это же устройство как блок
    var deviceBlockID;
    blocksIDs[key] = blocksIDs.count;
    deviceBlockID = blocksIDs.count;
    blocksIDs.count++;
    SQLbigQuery =
        SQLbigQuery +
            "INSERT INTO blocks (id, name, decimal, is_leading) VALUES (".concat(deviceBlockID, ", \"").concat(name, "\", \"").concat(decimal, "\", 1);\n");
    // Создаем связь
    SQLbigQuery =
        SQLbigQuery +
            "INSERT INTO blocks_in_devices (device_id, block_id) VALUES (".concat(deviceID, ", ").concat(deviceBlockID, ");\n");
    // Заполняем базу блоков
    device.includes.forEach(function (block) {
        var key = block.key, name = block.name, decimal = block.decimal;
        var blockID;
        if (blocksIDs.hasOwnProperty(key)) {
            blockID = blocksIDs[key];
            SQLbigQuery =
                SQLbigQuery +
                    "INSERT INTO blocks_in_devices (device_id, block_id) VALUES (".concat(deviceID, ", ").concat(blockID, ");\n");
        }
        else {
            blocksIDs[key] = blocksIDs.count;
            blockID = blocksIDs.count;
            blocksIDs.count++;
            SQLbigQuery =
                SQLbigQuery +
                    "INSERT INTO blocks (id, name, decimal) VALUES (".concat(blockID, ", \"").concat(name, "\", \"").concat(decimal, "\");\n");
            SQLbigQuery =
                SQLbigQuery +
                    "INSERT INTO blocks_in_devices (device_id, block_id) VALUES (".concat(deviceID, ", ").concat(blockID, ");\n");
        }
    });
});
// Создание БД неисправностей
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE defects (\n    \"id\" INTEGER NOT NULL UNIQUE, \n    \"description\" TEXT NOT NULL, \n    \"defect\" TEXT, \n    \"solution\" TEXT, \n    \"block_id\" INTEGER NOT NULL, \n    \"meta\" TEXT, \n    FOREIGN KEY (block_id) REFERENCES blocks(id), \n    PRIMARY KEY (\"id\" AUTOINCREMENT)\n);\n";
// Создание БД действий
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE actions (\n    \"id\" INTEGER NOT NULL UNIQUE, \n    \"action\" TEXT NOT NULL, \n    \"index\" TEXT NOT NULL, \n    \"defect_id\" INTEGER NOT NULL, \n    \"meta\" TEXT, FOREIGN KEY (defect_id) REFERENCES defects(id), \n    PRIMARY KEY (\"id\" AUTOINCREMENT)\n);\n";
// Создание таблицы связей ДЕЙСТВИЕ - МАТЕРИАЛЫ
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE materials_in_actions (\n    \"action_id\" INTEGER NOT NULL, \n    \"material_id\" INTEGER NOT NULL, \n    \"count\" FLOAT NOT NULL, \n    PRIMARY KEY (action_id, material_id), \n    FOREIGN KEY (action_id) REFERENCES actions(id), \n    FOREIGN KEY (material_id) REFERENCES materials(id)\n);\n";
// Заполнение таблицы дефектов
JSONdatabse.defects.forEach(function (Defect) {
    var deviceKey = Defect.deviceKey, description = Defect.description, defect = Defect.defect, solution = Defect.solution, actions = Defect.actions;
    var defectKey = Defect.key;
    var defectID;
    var blockID = blocksIDs[deviceKey];
    if (defectsIDs.hasOwnProperty(defectKey)) {
        defectID = defectsIDs[defectKey];
    }
    else {
        defectsIDs[defectKey] = defectsIDs.count;
        defectID = defectsIDs.count;
        defectsIDs.count++;
    }
    // Добавляем неисправность
    (SQLbigQuery =
        SQLbigQuery +
            "INSERT INTO defects (id, description, defect, solution, block_id) VALUES (".concat(defectID, ", \"").concat(description, "\", \"").concat(defect, "\", \"").concat(solution, "\", ").concat(blockID, ");\n")),
        // Добавляем действия к неисправности
        actions.forEach(function (Action) {
            var index = Action.index, action = Action.action, materials = Action.materials;
            var actionKey = Action.key;
            var actionID;
            if (actionsIDs.hasOwnProperty(actionKey)) {
                actionID = actionsIDs[actionKey];
            }
            else {
                actionsIDs[actionKey] = actionsIDs.count;
                actionID = actionsIDs.count;
                actionsIDs.count++;
            }
            SQLbigQuery =
                SQLbigQuery +
                    "INSERT INTO actions (\"id\", \"action\", \"index\", \"defect_id\") VALUES (".concat(actionID, ", \"").concat(action, "\", \"").concat(index, "\", ").concat(defectID, ");\n");
            materials.forEach(function (Material) {
                var count = Material.count, materialKey = Material.materialKey, key = Material.key;
                var materialID = materialsIDs[materialKey];
                SQLbigQuery =
                    SQLbigQuery +
                        "INSERT INTO materials_in_actions (action_id, material_id, count) VALUES (".concat(actionID, ", ").concat(materialID, ", ").concat(count, ");\n");
            });
        });
});
// Создание БД организаций
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"organiztions\" (\n    \"id\" INTEGER NOT NULL UNIQUE, \n    \"name\" TEXT NOT NULL, \n    \"city\" TEXT NOT NULL, \n    \"meta\" TEXT, \n    PRIMARY KEY(\"id\" AUTOINCREMENT)\n);\n";
// Создание БД контрактов
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"contracts\" (\n    \"id\" INTEGER NOT NULL UNIQUE, \n    \"number\" TEXT NOT NULL, \n    \"date\" TEXT NOT NULL, \n    \"organiztion_id\" INTEGER, \n    \"meta\" TEXT, \n    PRIMARY KEY(\"id\" AUTOINCREMENT), \n    FOREIGN KEY (organiztion_id) REFERENCES organiztions(id)\n);\n";
// Создание БД устройств в ремонте
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"repair_devices\" (\n    \"id\" INTEGER NOT NULL UNIQUE,\n    \"contract_id\" INTEGER NOT NULL,\n    \"device_id\" INTEGER NOT NULL,\n    \"create_time\" INTEGER NOT NULL,\n    \"change_time\" INTEGER NOT NULL,\n    \"repair_number\" INTEGER NOT NULL,\n    \"serial_number\" TEXT NOT NULL,\n    \"divided\"   INTEGER NOT NULL,\n    \"meta\" TEXT,\n    PRIMARY KEY(\"id\" AUTOINCREMENT),\n    FOREIGN KEY (\"contract_id\") REFERENCES contracts(id),\n    FOREIGN KEY (\"device_id\") REFERENCES defects(id)\n);\n";
// Создание БД примечаний
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE repair_notes (\n    \"id\" INTEGER NOT NULL,\n    \"text\" TEXT NOT NULL,\n    \"date\" INTEGER NOT NULL,\n    \"repair_device_id\" INTEGER NOT NULL,\n    PRIMARY KEY(\"id\" AUTOINCREMENT),\n    FOREIGN KEY (\"repair_device_id\") REFERENCES repair_devices(\"id\")\n);\n";
// Создание БД блоков в ремонте
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"repair_blocks\" (\n    \"id\"\tINTEGER NOT NULL UNIQUE,\n    \"block_id\"\tINTEGER NOT NULL,\n    \"serial_number\"\tTEXT NOT NULL,\n    \"repair_device_id\" INTEGER NOT NULL,\n    \"count\"\tREAL NOT NULL,\n    \"meta\" TEXT,\n    PRIMARY KEY(\"id\" AUTOINCREMENT),\n    FOREIGN KEY (\"repair_device_id\") REFERENCES repair_devices(id),\n    FOREIGN KEY (\"block_id\") REFERENCES blocks(id)\n);\n";
// СОздание таблицы связи БЛОК в ремонте - НЕИСПРАВНОСТЬ
SQLbigQuery =
    SQLbigQuery +
        "CREATE TABLE \"defects_in_repair\" (\n    \"repair_blocks_id\" INTEGER NOT NULL,\n    \"defect_id\" INTEGER NOT NULL,\n    PRIMARY KEY (repair_blocks_id, defect_id),\n    FOREIGN KEY (repair_blocks_id) REFERENCES repair_blocks(id),\n    FOREIGN KEY (defect_id) REFERENCES defects(id)            \n);\n";
// Заполнение БД организцай
organiztionsIDs.forEach(function (Organization, id) {
    var name = Organization.name, city = Organization.city;
    SQLbigQuery =
        SQLbigQuery +
            "INSERT INTO organiztions (\"id\", \"name\", \"city\") VALUES (".concat(id, ", \"").concat(name, "\", \"").concat(city, "\");\n");
});
// Заполнение БД контрактов
JSONdatabse.contracts.forEach(function (Contract) {
    var organizationName = Contract.organizationName, contractDate = Contract.contractDate, contractNumber = Contract.contractNumber, repairBase = Contract.repairBase;
    var ContractKey = Contract.key;
    var contractID;
    if (contractsIDs.hasOwnProperty(ContractKey)) {
        contractID = contractsIDs[ContractKey];
    }
    else {
        contractsIDs[ContractKey] = contractsIDs.count;
        contractID = contractsIDs.count;
        contractsIDs.count++;
    }
    var organiztionID = organiztionsIDs.findIndex(function (org) { return org.name === organizationName; });
    SQLbigQuery =
        SQLbigQuery +
            "INSERT INTO contracts (\"id\", \"number\", \"date\", \"organiztion_id\") VALUES (".concat(contractID, ", \"").concat(contractNumber, "\", \"").concat(contractDate, "\", ").concat(organiztionID, ");\n");
    // Заполнение БД устройств в ремонте
    repairBase.forEach(function (RepairDevice) {
        var changeTime = RepairDevice.changeTime, createTime = RepairDevice.createTime, deviceKey = RepairDevice.deviceKey, repairNumber = RepairDevice.repairNumber, serialNumber = RepairDevice.serialNumber, subDevices = RepairDevice.subDevices, divided = RepairDevice.divided;
        var RepairDeviceKey = RepairDevice.key;
        var deviceID = devicesIDs[deviceKey];
        var repairDeviceID;
        if (repairDevicesIDs.hasOwnProperty(RepairDeviceKey)) {
            repairDeviceID = repairDevicesIDs[RepairDeviceKey];
        }
        else {
            repairDevicesIDs[RepairDeviceKey] = repairDevicesIDs.count;
            repairDeviceID = repairDevicesIDs.count;
            repairDevicesIDs.count++;
        }
        SQLbigQuery =
            SQLbigQuery +
                "INSERT INTO repair_devices (\"id\", \"contract_id\", \"device_id\", \"create_time\", \"change_time\", \"repair_number\", \"serial_number\", \"divided\") VALUES (".concat(repairDeviceID, ", ").concat(contractID, ", ").concat(deviceID, ", ").concat(createTime, ", ").concat(changeTime, ", ").concat(repairNumber, ", \"").concat(serialNumber, "\", ").concat(+Boolean(divided), ");\n");
        // Заполнение базы блоков в ремонте
        RepairDevice.notes.forEach(function (Note) {
            var text = Note.text, date = Note.date;
            noteID++;
            SQLbigQuery =
                SQLbigQuery +
                    "INSERT INTO repair_notes (\"id\", \"text\", \"date\", \"repair_device_id\") VALUES (".concat(noteID, ", \"").concat(text, "\", ").concat(date, ", ").concat(repairDeviceID, ");\n");
        });
        subDevices.forEach(function (Block) {
            var subDeviceKey = Block.subDeviceKey, serialNumber = Block.serialNumber, count = Block.count, defects = Block.defects;
            var blockKey = Block.key;
            var blockID = blocksIDs[subDeviceKey];
            var repairBlockID;
            if (repairBlocksIDs.hasOwnProperty(RepairDeviceKey)) {
                repairBlockID = repairBlocksIDs[subDeviceKey];
            }
            else {
                repairBlocksIDs[subDeviceKey] = repairBlocksIDs.count;
                repairBlockID = repairBlocksIDs.count;
                repairBlocksIDs.count++;
            }
            SQLbigQuery =
                SQLbigQuery +
                    "INSERT INTO repair_blocks (\"id\", \"block_id\", \"serial_number\", \"count\", \"repair_device_id\") VALUES (".concat(repairBlockID, ", ").concat(blockID, ", \"").concat(serialNumber, "\", ").concat(count, ", ").concat(repairDeviceID, ");\n");
            defects.forEach(function (Defect) {
                var defectID = defectsIDs[Defect];
                SQLbigQuery =
                    SQLbigQuery +
                        "INSERT INTO defects_in_repair (\"repair_blocks_id\", \"defect_id\") VALUES (".concat(repairBlockID, ", ").concat(defectID, ");\n");
            });
        });
    });
});
console.log("Text formed");
fs.writeFileSync(path.resolve(__dirname, 'SQL.txt'), SQLbigQuery);
db.exec(SQLbigQuery, function (error) {
    if (error) {
        console.log(error);
    }
});
