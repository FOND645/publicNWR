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
var startTime = new Date().getTime();
var total = 0;
var complite = 0;
db.serialize(function () {
    total++;
    db.run("CREATE TABLE \"materials\" (\n        \"id\"\tINTEGER NOT NULL UNIQUE,\n        \"name\"\tTEXT NOT NULL,\n        \"unit\"\tTEXT NOT NULL,\n        \"meta\" TEXT,\n        PRIMARY KEY(\"id\" AUTOINCREMENT)\n    );", function (err) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (err)
            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0411\u0414", err);
    });
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
        total++;
        db.run("INSERT INTO materials (id, name, unit) VALUES (?, ?, ?)", [materialID, name, unit], function (error) {
            complite++;
            console.log("".concat(complite, " \u0438\u0437 ").concat(total));
            if (error) {
                console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0438 \u0432 \u0431\u0434", error);
            }
            else {
                console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B ID:".concat(materialID, ", name:").concat(name));
            }
        });
    });
    // Создаем базу изделий
    total++;
    db.run("CREATE TABLE \"devices\" (\n        \"id\"\tINTEGER NOT NULL UNIQUE,\n        \"name\"\tTEXT NOT NULL,\n        \"decimal\"\tTEXT NOT NULL,\n        \"meta\" TEXT,\n        PRIMARY KEY (\"id\" AUTOINCREMENT)\n    );", function (error) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (error) {
            console.log(error);
        }
        else {
            console.log('Создана таблица devices');
        }
    });
    // Создаем базу блоков
    total++;
    db.run("CREATE TABLE \"blocks\" (\n        \"id\"\tINTEGER NOT NULL UNIQUE,\n        \"name\"\tTEXT NOT NULL,\n        \"decimal\"\tTEXT NOT NULL,\n        \"is_leading\"   INTEGER,\n        \"meta\" TEXT,\n        PRIMARY KEY (\"id\" AUTOINCREMENT)\n    );", function (error) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (error) {
            console.log(error);
        }
        else {
            console.log('Создана таблица blocks');
        }
    });
    // Создаем таблицу связей изделий и блоков
    total++;
    db.run("CREATE TABLE blocks_in_devices (\n        \"device_id\" INTEGER NOT NULL,\n        \"block_id\" INTEGER NOT NULL,\n        PRIMARY KEY (device_id, block_id),\n        FOREIGN KEY (device_id) REFERENCES devices(id),\n        FOREIGN KEY (block_id) REFERENCES blocks(id)\n    )", function (error) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (error) {
            console.log(error);
        }
        else {
            console.log('Создана таблица blocks_in_devices');
        }
    });
    // Заполняем базу изделий
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
        total++;
        db.run('INSERT INTO devices (id, name, decimal) VALUES (?, ?, ?)', [deviceID, name, decimal], function (error) {
            complite++;
            console.log("".concat(complite, " \u0438\u0437 ").concat(total));
            if (error) {
                console.log('Ошибка при добавлении устройства', error);
            }
            else {
                console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E ID:".concat(deviceID, ", name:").concat(name));
            }
        });
        // Добавляем это же устройство как блок
        var deviceBlockID;
        blocksIDs[key] = blocksIDs.count;
        deviceBlockID = blocksIDs.count;
        blocksIDs.count++;
        total++;
        db.run('INSERT INTO blocks (id, name, decimal, is_leading) VALUES (?, ?, ?, ?)', [deviceBlockID, name, decimal, 1], function (error) {
            complite++;
            console.log("".concat(complite, " \u0438\u0437 ").concat(total));
            if (error) {
                console.log('Ошибка при добавлении устройства в блоки', error);
            }
            else {
                console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E-\u0431\u043B\u043E\u043A ID:".concat(deviceBlockID, ", name:").concat(name));
            }
        });
        // Создаем связь
        total++;
        db.run('INSERT INTO blocks_in_devices (device_id, block_id) VALUES (?, ?)', [deviceID, deviceBlockID], function (error) {
            complite++;
            console.log("".concat(complite, " \u0438\u0437 ").concat(total));
            if (error) {
                console.log('Ошибка при создании связи Устройство - устройство в блоках', error);
            }
            else {
                console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0441\u0432\u044F\u0437\u044C \u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E - \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E \u0432 \u0431\u043B\u043E\u043A\u0430\u0445 ID:".concat(deviceBlockID, ", name:").concat(name));
            }
        });
        // Заполняем базу блоков
        device.includes.forEach(function (block) {
            var key = block.key, name = block.name, decimal = block.decimal;
            var blockID;
            if (blocksIDs.hasOwnProperty(key)) {
                blockID = blocksIDs[key];
                total++;
                db.run('INSERT INTO blocks_in_devices (device_id, block_id) VALUES (?, ?)', [deviceID, blockID], function (error) {
                    complite++;
                    console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                    if (error) {
                        console.log('Ошибка при добавлении существующего блока', error);
                    }
                    else {
                        console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u0441\u0432\u044F\u0437\u044C: ".concat(deviceID, " - ").concat(blockID));
                    }
                });
            }
            else {
                blocksIDs[key] = blocksIDs.count;
                blockID = blocksIDs.count;
                blocksIDs.count++;
                total++;
                db.run('INSERT INTO blocks (id, name, decimal) VALUES (?, ?, ?)', [blockID, name, decimal], function (error) {
                    complite++;
                    console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                    if (error) {
                        console.log('Ошибка при добавлении нового блока', error);
                    }
                    else {
                        console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0431\u043B\u043E\u043A ID:".concat(blockID, ", name:").concat(name));
                    }
                });
                total++;
                db.run('INSERT INTO blocks_in_devices (device_id, block_id) VALUES (?, ?)', [deviceID, blockID], function (error) {
                    complite++;
                    console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                    if (error) {
                        console.log('Ошибка при создании связи', error);
                    }
                    else {
                        console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u0441\u0432\u044F\u0437\u044C: ".concat(deviceID, " - ").concat(blockID));
                    }
                });
            }
        });
    });
    // Создаем базу неисправностей
    total++;
    db.run("CREATE TABLE defects (\n        \"id\" INTEGER NOT NULL UNIQUE,\n        \"description\" TEXT NOT NULL,\n        \"defect\" TEXT,\n        \"solution\" TEXT,\n        \"block_id\" INTEGER NOT NULL,\n        \"meta\" TEXT,\n        FOREIGN KEY (block_id) REFERENCES blocks(id),\n        PRIMARY KEY (\"id\" AUTOINCREMENT)\n    );", function (error) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (error) {
            console.log('Ошибка при создании базы дефектов', error);
        }
        else {
            console.log('Создана база дефектов');
        }
    });
    // Создаем базу действий
    total++;
    db.run("CREATE TABLE actions (\n        \"id\" INTEGER NOT NULL UNIQUE,\n        \"action\" TEXT NOT NULL,\n        \"index\" TEXT NOT NULL,\n        \"defect_id\" INTEGER NOT NULL,\n        \"meta\" TEXT,\n        FOREIGN KEY (defect_id) REFERENCES defects(id),\n        PRIMARY KEY (\"id\" AUTOINCREMENT)\n    );", function (error) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (error) {
            console.log('Ошибка при создании базы действий', error);
        }
        else {
            console.log('Создана база действий');
        }
    });
    // Создаем таблицу связи ДЕЙСТВИЕ - МАТЕРИАЛЫ
    total++;
    db.run("CREATE TABLE materials_in_actions (\n        \"action_id\" INTEGER NOT NULL,\n        \"material_id\" INTEGER NOT NULL,\n        \"count\" FLOAT NOT NULL,\n        PRIMARY KEY (action_id, material_id),\n        FOREIGN KEY (action_id) REFERENCES actions(id),\n        FOREIGN KEY (material_id) REFERENCES materials(id)\n    );", function (error) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (error) {
            console.log('Ошибка при создании таблицы связи ДЕЙСТВИЕ - МАТЕРИАЛЫ', error);
        }
        else {
            console.log('Создана таблица связи ДЕЙСТВИЕ - МАТЕРИАЛЫ');
        }
    });
    // Создаем таблицу связи НЕИСПРАВНОСТЬ - ДЕЙСТВИЯ
    // db.run(
    //     `CREATE TABLE actions_in_defects (
    //     "defect_id" INTEGER NOT NULL,
    //     "action_id" INTEGER NOT NULL,
    //     PRIMARY KEY (action_id, defect_id),
    //     FOREIGN KEY (action_id) REFERENCES actions(id),
    //     FOREIGN KEY (defect_id) REFERENCES defects(id)
    // )`,
    //     (error) => {
    //         if (error) {
    //             console.log("Ошибка при создании таблицы связи ДЕЙСТВИЕ - МАТЕРИАЛЫ", error);
    //         } else {
    //             console.log("Создана таблица связи ДЕЙСТВИЕ - МАТЕРИАЛЫ");
    //         }
    //     }
    // );
    // Создаем таблицу связи БЛОК - НЕИСПРАВНОСТИ
    // db.run(
    //     `CREATE TABLE defects_in_blocks (
    //     "block_id" INTEGER NOT NULL,
    //     "defect_id" INTEGER NOT NULL,
    //     PRIMARY KEY (block_id, defect_id),
    //     FOREIGN KEY (block_id) REFERENCES blocks(id),
    //     FOREIGN KEY (defect_id) REFERENCES defects(id)
    // )`,
    //     (error) => {
    //         if (error) {
    //             console.log("Ошибка при создании таблицы связи БЛОКИ - НЕИСПРАВНОСТИ", error);
    //         } else {
    //             console.log("Создана таблица связи БЛОКИ - НЕИСПРАВНОСТИ");
    //         }
    //     }
    // );
    // Заполняем таблицу дефектов
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
        total++;
        db.run("INSERT INTO defects (id, description, defect, solution, block_id) VALUES (?, ?, ?, ?, ?)", [defectID, description, defect, solution, blockID], function (error) {
            complite++;
            console.log("".concat(complite, " \u0438\u0437 ").concat(total));
            if (error) {
                console.log('Ошибка при добавлении неисправности', error);
            }
            else {
                console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u043D\u0435\u0438\u0441\u043F\u0440\u0430\u0432\u043D\u043E\u0441\u0442\u044C ID:".concat(defectID, ", name:").concat(description));
            }
        });
        // db.run(`INSERT INTO defects_in_blocks (block_id, defect_id) VALUES (?, ?)`, [blockID, defectID], (error) => {
        //     if (error) {
        //         console.log("Ошибка при связывании БЛОК - НЕИСПРАВНОЕСТЬ", error);
        //     } else {
        //         console.log(`Добавлена связь ${defectID} - ${blockID}`);
        //     }
        // });
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
            total++;
            db.run("INSERT INTO actions (\"id\", \"action\", \"index\", \"defect_id\") VALUES (?, ?, ?, ?)", [actionID, action, index, defectID], function (error) {
                complite++;
                console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                if (error) {
                    console.log('Ошибка при добавлении действия', error);
                }
                else {
                    console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 ID:".concat(actionID, ", name:").concat(action));
                }
            });
            // db.run(`INSERT INTO actions_in_defects (action_id, defect_id) VALUES (?, ?)`, [actionID, defectID], (error) => {
            //     if (error) {
            //         console.log("Ошибка при связывании НЕИСПРАВНОЕСТЬ - ДЕЙСТВИЕ", error);
            //     } else {
            //         console.log(`Добавлена связь ${actionID} - ${blockID}`);
            //     }
            // });
            materials.forEach(function (Material) {
                var count = Material.count, materialKey = Material.materialKey, key = Material.key;
                var materialID = materialsIDs[materialKey];
                total++;
                db.run("INSERT INTO materials_in_actions (action_id, material_id, count) VALUES (?, ?, ?)", [actionID, materialID, count], function (error) {
                    complite++;
                    console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                    if (error) {
                        console.log('Ошибка при связывании ДЕЙСТВИЕ - МАТЕРИАЛ', error);
                    }
                    else {
                        console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u0441\u0432\u044F\u0437\u044C ".concat(actionID, " - ").concat(materialID));
                    }
                });
            });
        });
    });
    // Создаем БД организаций
    total++;
    db.run("CREATE TABLE \"organiztions\" (\n        \"id\"\tINTEGER NOT NULL UNIQUE,\n        \"name\"\tTEXT NOT NULL,\n        \"city\"\tTEXT NOT NULL,\n        \"meta\" TEXT,\n        PRIMARY KEY(\"id\" AUTOINCREMENT)\n    );", function (err) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (err) {
            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0439");
        }
        else {
            console.log("\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0439");
        }
    });
    // Создаем БД контрактов
    total++;
    db.run("CREATE TABLE \"contracts\" (\n        \"id\"\tINTEGER NOT NULL UNIQUE,\n        \"number\"\tTEXT NOT NULL,\n        \"date\"\tTEXT NOT NULL,\n        \"organiztion_id\"\tINTEGER,\n        \"meta\" TEXT,\n        PRIMARY KEY(\"id\" AUTOINCREMENT),\n        FOREIGN KEY (organiztion_id) REFERENCES organiztions(id)\n    );", function (err) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (err) {
            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u043E\u0432");
        }
        else {
            console.log("\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u043E\u0432");
        }
    });
    // Создаем БД устройств в ремонте
    total++;
    db.run("CREATE TABLE \"repair_devices\" (\n        \"id\"\tINTEGER NOT NULL UNIQUE,\n        \"contract_id\"\tINTEGER NOT NULL,\n        \"device_id\"\tINTEGER NOT NULL,\n        \"create_time\"\tINTEGER NOT NULL,\n        \"change_time\"\tINTEGER NOT NULL,\n        \"repair_number\"\tINTEGER NOT NULL,\n        \"serial_number\"\tTEXT NOT NULL,\n        \"divided\"   INTEGER NOT NULL,\n        \"meta\" TEXT,\n        PRIMARY KEY(\"id\" AUTOINCREMENT),\n        FOREIGN KEY (\"contract_id\") REFERENCES contracts(id),\n        FOREIGN KEY (\"device_id\") REFERENCES defects(id)\n    );", function (err) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (err) {
            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432 \u0432 \u0440\u0435\u043C\u043E\u043D\u0442\u0435");
        }
        else {
            console.log("\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432 \u0432 \u0440\u0435\u043C\u043E\u043D\u0442\u0435");
        }
    });
    // Создаем БД примечаний
    db.run("CREATE TABLE repair_notes (\n        \"id\" INTEGER NOT NULL,\n        \"text\" TEXT NOT NULL,\n        \"date\" INTEGER NOT NULL,\n        \"repair_device_id\" INTEGER NOT NULL,\n        PRIMARY KEY(\"id\" AUTOINCREMENT),\n        FOREIGN KEY (\"repair_device_id\") REFERENCES repair_devices(\"id\")\n        );", function (err) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (err) {
            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u043F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0439");
        }
        else {
            console.log("\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u043F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0439");
        }
    });
    // Создаем БД блоков в ремонте
    total++;
    db.run("CREATE TABLE \"repair_blocks\" (\n        \"id\"\tINTEGER NOT NULL UNIQUE,\n        \"block_id\"\tINTEGER NOT NULL,\n        \"serial_number\"\tTEXT NOT NULL,\n        \"repair_device_id\" INTEGER NOT NULL,\n        \"count\"\tREAL NOT NULL,\n        \"meta\" TEXT,\n        PRIMARY KEY(\"id\" AUTOINCREMENT),\n        FOREIGN KEY (\"repair_device_id\") REFERENCES repair_devices(id),\n        FOREIGN KEY (\"block_id\") REFERENCES blocks(id)\n    );", function (err) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (err) {
            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0431\u043B\u043E\u043A\u043E\u0432 \u0432 \u0440\u0435\u043C\u043E\u043D\u0442\u0435");
        }
        else {
            console.log("\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0431\u043B\u043E\u043A\u043E\u0432 \u0432 \u0440\u0435\u043C\u043E\u043D\u0442\u0435");
        }
    });
    // Создаем таблицу связи БЛОК в ремонте - НЕИСПРАВНОСТИ
    total++;
    db.run("CREATE TABLE \"defects_in_repair\" (\n            \"repair_blocks_id\" INTEGER NOT NULL,\n            \"defect_id\" INTEGER NOT NULL,\n            PRIMARY KEY (repair_blocks_id, defect_id),\n            FOREIGN KEY (repair_blocks_id) REFERENCES repair_blocks(id),\n            FOREIGN KEY (defect_id) REFERENCES defects(id)            \n    )", function (err) {
        complite++;
        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
        if (err) {
            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0441\u0432\u044F\u0437\u0438 \u0411\u041B\u041E\u041A \u0432 \u0440\u0435\u043C\u043E\u043D\u0442\u0435 - \u041D\u0415\u0418\u0421\u041F\u0420\u0410\u0412\u041D\u041E\u0421\u0422\u0418");
        }
        else {
            console.log("\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0441\u0432\u044F\u0437\u0438 \u0411\u041B\u041E\u041A \u0432 \u0440\u0435\u043C\u043E\u043D\u0442\u0435 - \u041D\u0415\u0418\u0421\u041F\u0420\u0410\u0412\u041D\u041E\u0421\u0422\u0418");
        }
    });
    organiztionsIDs.forEach(function (Organization, id) {
        var name = Organization.name, city = Organization.city;
        total++;
        db.run('INSERT INTO organiztions ("id", "name", "city") VALUES (?, ?, ?)', [id, name, city], function (err) {
            complite++;
            console.log("".concat(complite, " \u0438\u0437 ").concat(total));
            if (err) {
                console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438 ".concat(id, " ").concat(name, " ").concat(city), err);
            }
            else {
                console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F ".concat(id, " ").concat(name, " ").concat(city));
            }
        });
    });
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
        total++;
        db.run("INSERT INTO contracts (\"id\", \"number\", \"date\", \"organiztion_id\") VALUES (?, ?, ?, ?)", [contractID, contractNumber, contractDate, organiztionID], function (err) {
            complite++;
            console.log("".concat(complite, " \u0438\u0437 ").concat(total));
            if (err) {
                console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430 ".concat(contractID, " ").concat(contractNumber, " ").concat(organiztionID), err);
            }
            else {
                console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 ".concat(contractID, " ").concat(contractNumber, " ").concat(organiztionID));
            }
        });
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
            total++;
            db.run("INSERT INTO repair_devices (\"id\", \"contract_id\", \"device_id\", \"create_time\", \"change_time\", \"repair_number\", \"serial_number\", \"divided\") VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                repairDeviceID,
                contractID,
                deviceID,
                createTime,
                changeTime,
                repairNumber,
                serialNumber,
                +Boolean(divided),
            ], function (err) {
                complite++;
                console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                if (err) {
                    console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \u0440\u0435\u043C\u043E\u043D\u0442\u0430 ".concat(repairDeviceID, ", ").concat(contractID, ", ").concat(deviceID, ", ").concat(createTime, ", ").concat(changeTime, ", ").concat(repairNumber, ", ").concat(serialNumber), err);
                }
                else {
                    console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E \u0440\u0435\u043C\u043E\u043D\u0442\u0430 ".concat(repairNumber, " ").concat(repairDevicesIDs, " ").concat(deviceID, " ").concat(serialNumber));
                }
            });
            RepairDevice.notes.forEach(function (Note) {
                var text = Note.text, date = Note.date;
                noteID++;
                db.run("INSERT INTO repair_notes (\"id\", \"text\", \"date\", \"repair_device_id\") VALUES (?, ?, ?, ?)", [noteID, text, date, repairDeviceID], function (result, error) {
                    complite++;
                    console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                    if (error) {
                        console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435 \u043A \u0440\u0435\u043C\u043E\u043D\u0442\u0443", noteID, text, date, repairDeviceID);
                    }
                    else {
                        console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435 \u043A \u0440\u0435\u043C\u043E\u043D\u0442\u0443", noteID, text, date, repairDeviceID);
                    }
                });
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
                total++;
                db.run("INSERT INTO repair_blocks (\"id\", \"block_id\", \"serial_number\", \"count\", \"repair_device_id\") VALUES (?, ?, ?, ?, ?)", [
                    repairBlockID,
                    blockID,
                    serialNumber,
                    count,
                    repairDeviceID,
                ], function (err) {
                    complite++;
                    console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                    if (err) {
                        console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0431\u043B\u043E\u043A\u0430 \u0440\u0435\u043C\u043E\u043D\u0442\u0430 ".concat(repairBlockID, ", ").concat(blockID, ", ").concat(serialNumber, ", ").concat(count), err);
                    }
                    else {
                        console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0431\u043B\u043E\u043A\u0430 \u0440\u0435\u043C\u043E\u043D\u0442\u0430 ".concat(blockID, " ").concat(serialNumber));
                    }
                });
                defects.forEach(function (Defect) {
                    var defectID = defectsIDs[Defect];
                    total++;
                    db.run("INSERT INTO defects_in_repair (\"repair_blocks_id\", \"defect_id\") VALUES (?, ?)", [repairBlockID, defectID], function (err) {
                        complite++;
                        console.log("".concat(complite, " \u0438\u0437 ").concat(total));
                        if (err) {
                            console.log("\u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0432\u044F\u0437\u0438 \u0411\u041B\u041E\u041A ".concat(repairBlockID, " - \u041D\u0415\u0418\u0421\u041F\u0420\u0410\u0412\u041D\u041E\u0421\u0422\u042C ").concat(defectID), err);
                        }
                        else {
                            console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u0441\u0432\u044F\u0437\u044C \u0411\u041B\u041E\u041A ".concat(repairBlockID, " - \u041D\u0415\u0418\u0421\u041F\u0420\u0410\u0412\u041D\u041E\u0421\u0422\u042C ").concat(defectID));
                        }
                    });
                });
            });
        });
    });
    // db.all(`SELECT `)
});
var endTime = new Date().getTime();
var totalTime = new Date(endTime - startTime);
var timeString = "".concat(totalTime
    .getHours()
    .toString()
    .padStart(2, "0"), ":").concat(totalTime
    .getMinutes()
    .toString()
    .padStart(2, "0"), ":").concat(totalTime.getSeconds().toString().padStart(2, "0"));
console.log(timeString);
