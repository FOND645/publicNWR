import { store } from "./storage/reducer";

const fs = require("fs");
const XLSX = require("xlsx-populate");
const _ = require("lodash");
const path = require("path");

// Рекрсивная функция поиска в объекте
export function hasDeepProperty(obj, targetValue) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value === targetValue) {
                return true;
            }
            if (typeof value === "object" && value !== null) {
                if (hasDeepProperty(value, targetValue)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Сортировка событий прогресса
export function progressEventsSorter(a, b) {
    if (a.date === false && b.date === false) return 0;
    if (a.date === false) return 1;
    if (b.date === false) return -1;
    return a - b;
}

// Функция заменяющая обратные слэши "\" на прямые "/"
export function replaceSlash(text) {
    text = text.replace("\\", "/");
    if (text.includes("\\")) {
        text = replaceSlash(text);
    }
    return text;
}

// Функция создающая событие при демонтаже комопнента
export function contentUnmounted() {
    let event = new Event("component_unmounted", { bubbles: true, composed: true });
    document.dispatchEvent(event);
}

// Кастомная функция округления
function round(num) {
    num = num * 100000;
    num = Math.trunc(num);
    num = num / 100000;
    return num;
}

// Функция слияния двух стейтов
export function mergeObjects(oldObject, newOlject) {
    const merger = (oldValue, newValue) => {
        if (_.isObject(oldValue) && _.isObject(newValue)) {
            return mergeObjects(oldValue, newValue);
        } else {
            return oldValue == newValue ? oldValue : newValue;
        }
    };

    return _.mergeWith(oldObject, newOlject, merger);
}

// Функция импорта нового бланка документа (дефектовка или ПВР)
export function importBlank(file, pathToPut) {
    // Удаляем старые бланки
    try {
        fs.unlinkSync(pathToPut);
    } catch (error) {}

    // ИМпортируем новые
    fs.copyFileSync(file.path, pathToPut);
}

// Функция записи инфорамции в БД в файл
export function saveBase(data, path, baseType) {
    console.log("Записана база ", baseType, " в файл ", path);
    fs.writeFileSync(path, JSON.stringify(data));
}

// Проверка наличия и создание несущестующих папок
export function checkFolder(folder) {
    try {
        fs.statSync(folder);
    } catch (error) {
        if (error.code === "ENOENT") {
            fs.mkdirSync(folder);
        }
    }
}

// Функция форматирует объект date в виде цифр в читаемую дату/время
export function formatDate(date) {
    date = new Date(date);
    const months = ["янв.", "фев.", "март", "апр.", "май", "июнь", "июль", "авг.", "сен.", "окт.", "ноя.", "дек."];

    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
}

export function isFolderAbleToRemove(pathToFolder) {
    const fileList = fs.readdirSync(pathToFolder, { withFileTypes: true });
    for (let fileObj of fileList) {
        console.log(pathToFolder, fileObj);
        if (fileObj.isFile()) {
            if (!isFileAbleToRemove(path.resolve(pathToFolder, fileObj.name))) return false;
        } else {
            if (!isFolderAbleToRemove(path.resolve(pathToFolder, fileObj.name))) return false;
        }
    }
    return true;
}

export function isFileAbleToRemove(filePath) {
    let result;
    try {
        fs.accessSync(filePath, fs.constants.W_OK);
        result = true;
    } catch (error) {
        console.error(error);
        result = false;
    }
    return result;
}

// Проверка существования файла
export function fileAvailable(filePath) {
    let result;
    try {
        fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
        result = true;
    } catch (error) {
        result = false;
    }
    return result;
}

// ----------------------------------
// Создание дефектовочной ведомости
// ----------------------------------
export async function defectList(route) {
    const { contractKey, deviceKey } = route;

    const state = store.getState();
    const { devicesBase, defectsBase, contracts, settings } = state;
    const { dataBasePath, documentsBasePath } = settings;

    let subDevices = [];
    devicesBase.forEach((dev) => {
        subDevices.push({ name: dev.name, decimal: dev.decimal, key: dev.key });
        dev.includes.forEach((subDev) => {
            subDevices.push({ ...subDev });
        });
    });

    const currentContract = contracts.find((contract) => contract.key == contractKey);
    const { organizationName, contractDate, contractNumber, repairBase } = currentContract;

    const currentDevice = repairBase.find((device) => device.key == deviceKey);

    const currentDeviceInBase = devicesBase.find((dev) => dev.key == currentDevice.deviceKey);

    const blanksFolder = path.resolve(dataBasePath, "blanks", contractKey);
    const defectBlankPath = path.resolve(blanksFolder, `${currentDevice.deviceKey}_defectBlank.xlsx`);
    const defectListsFoler = path.resolve(documentsBasePath, contractKey, "Карты дефектации");
    const defectListPath = path.resolve(
        defectListsFoler,
        `${currentDeviceInBase.name} - № ${currentDevice.repairNumber} ${currentDevice.serialNumber}.xlsx`
    );

    let replaceFields = {
        SN: currentDevice.serialNumber,
        repairNumber: currentDevice.repairNumber,
        organizationName,
        contractNumber,
        contractDate,
    };

    // Выделяем дублированные блоки
    let blocksToDouble = new Set();
    currentDevice.subDevices.forEach((dev) => {
        currentDevice.subDevices.forEach((inDev) => {
            if (dev.subDeviceKey == inDev.subDeviceKey && dev.key != inDev.key) {
                blocksToDouble.add(dev.subDeviceKey);
            }
        });
    });
    let doubledBlocks = currentDevice.subDevices.filter((dev) => blocksToDouble.has(dev.subDeviceKey));
    let unDoubledBlocks = currentDevice.subDevices.filter((dev) => !blocksToDouble.has(dev.subDeviceKey));

    // Для каждого вида дублированых блоков выбираем их в массив и массив уже отрабатываем
    blocksToDouble.forEach((doubl) => {
        doubledBlocks
            .filter((dev) => dev.subDeviceKey == doubl)
            .forEach((dDev, i) => {
                let index = i + 1;
                let currentDeviceInBase = subDevices.find((dev) => dev.key == dDev.subDeviceKey);
                replaceFields[currentDeviceInBase.decimal + "#" + index + "_cnt"] = dDev.count == 0 ? "отсутствует" : dDev.count;
                replaceFields[currentDeviceInBase.decimal + "#" + index + "_SN"] = dDev.serialNumber;
                let defectPaste = "";
                let solutionPast = "";
                dDev.defects.forEach((defKey) => {
                    const currentDefect = defectsBase.find((def) => def.key == defKey);
                    defectPaste = defectPaste + currentDefect.defect + "\r";
                    solutionPast = solutionPast + currentDefect.solution + "\r";
                });
                replaceFields[currentDeviceInBase.decimal + "#" + index + "_defects"] = defectPaste;
                replaceFields[currentDeviceInBase.decimal + "#" + index + "_solutions"] = solutionPast;
            });
    });

    unDoubledBlocks.forEach((subDev) => {
        let currentDeviceInBase = subDevices.find((dev) => dev.key == subDev.subDeviceKey);
        replaceFields[currentDeviceInBase.decimal + "_cnt"] = subDev.count == 0 ? "отсутствует" : subDev.count;
        replaceFields[currentDeviceInBase.decimal + "_SN"] = subDev.serialNumber;
        let defectPaste = "";
        let solutionPast = "";
        subDev.defects.forEach((defKey) => {
            const currentDefect = defectsBase.find((def) => def.key == defKey);
            if (currentDefect.defect != "") {
                defectPaste = defectPaste + currentDefect.defect + "\r";
            }
            if (currentDefect.solution != "") {
                solutionPast = solutionPast + currentDefect.solution + "\r";
            }
        });
        replaceFields[currentDeviceInBase.decimal + "_defects"] = defectPaste;
        replaceFields[currentDeviceInBase.decimal + "_solutions"] = solutionPast;
    });

    await new Promise((resolve, reject) => {
        XLSX.fromFileAsync(defectBlankPath).then((doc) => {
            const sheet = doc.sheet(0);
            for (let field in replaceFields) {
                sheet.find("{" + field + "}", (_) => replaceFields[field]);
            }

            doc.toFileAsync(defectListPath).then(() => resolve());
        });
    });
    return { defectListPath: defectListPath };
}

// ----------------------------------
// Создание перечня выполененых работ
// ----------------------------------
export async function actionList(route) {
    let data = new Map();
    const { contractKey, deviceKey } = route;
    const state = store.getState();
    const { devicesBase, defectsBase, materialsBase, settings, contracts } = state;

    const currentContract = contracts.find((contract) => contract.key == contractKey);
    const { repairBase, contractNumber, contractDate } = currentContract;

    const { documentsBasePath, dataBasePath } = settings;

    const currentDevice = repairBase.find((device) => device.key == deviceKey);

    const currentDeviceInBase = devicesBase.find((dev) => dev.key == currentDevice.deviceKey);

    const blanksFolder = path.resolve(dataBasePath, "blanks", contractKey);
    const actionBlankPath = path.resolve(blanksFolder, `${currentDevice.deviceKey}_actionBlank.xlsx`);

    const acitonListsFolder = path.resolve(documentsBasePath, contractKey, "Перечни выполненых работ");
    const actionListPath = path.resolve(
        acitonListsFolder,
        `${currentDeviceInBase.name} - № ${currentDevice.repairNumber} ${currentDevice.serialNumber}.xlsx`
    );

    // Определяем номер ремонта и серийный номер
    data.set("repairNumber", currentDevice.repairNumber);
    data.set("SN", currentDevice.serialNumber);
    data.set("contractNumber", contractNumber);
    data.set("contractDate", contractDate);

    // Выделяем дублированные блоки
    let blocksToDouble = new Set();
    currentDevice.subDevices.forEach((dev) => {
        currentDevice.subDevices.forEach((inDev) => {
            if (dev.subDeviceKey == inDev.subDeviceKey && dev.key != inDev.key) {
                blocksToDouble.add(dev.subDeviceKey);
            }
        });
    });
    let doubledBlocks = currentDevice.subDevices.filter((dev) => blocksToDouble.has(dev.subDeviceKey));
    let unDoubledBlocks = currentDevice.subDevices.filter((dev) => !blocksToDouble.has(dev.subDeviceKey));

    // Собираем действия
    let actions = [];

    // НЕ дублированные блоки
    unDoubledBlocks.forEach((subDev) => {
        subDev.defects.forEach((def) => {
            const currentDefect = defectsBase.find((d) => d.key == def);
            currentDefect.actions.forEach((act) => {
                actions.push({ index: act.index, action: act.action, materials: act.materials });
            });
        });
    });
    actions = JSON.parse(JSON.stringify(actions));

    // ДУБЛИРОВАННЫЕ блоки
    blocksToDouble.forEach((dBlockKey) => {
        doubledBlocks
            .filter((bl) => bl.subDeviceKey == dBlockKey)
            .forEach((subDev, ind) => {
                subDev.defects.forEach((defKey) => {
                    const currentDefect = defectsBase.find((d) => d.key == defKey);
                    currentDefect.actions.forEach((act) => {
                        let index = +act.index.slice(0, 2) + ind;
                        index = index < 10 ? "0" + index.toString() : index;
                        index = index.toString() + act.index.slice(2);
                        actions.push({ index: index, action: act.action, materials: act.materials });
                    });
                });
            });
    });
    actions = JSON.parse(JSON.stringify(actions));

    // Исключения. Действия имеющие "-" в начале индекса вытесняют все остальные
    // с такими же первыми цифрами в индексе.
    let removeActionsIndex = [];
    actions.forEach((act) => {
        if (act.index[0] == "-") {
            removeActionsIndex.push(act.index.slice(1, 3));
        }
    });
    removeActionsIndex.forEach((ind) => {
        actions = actions.filter((act) => act.index.slice(0, 2) != ind);
    });
    actions.map((act) => {
        if (act.index[0] == "-") {
            act.index = act.index.slice(1);
            return act;
        } else return act;
    });

    // Сортируем все действия по индексам
    actions.sort((a, b) => {
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
        return 0;
    });

    // Удаляем дублированные действия
    let temp;
    for (let s = 0; s < actions.length; s++) {
        if (s == 0) {
            temp = actions[s];
            continue;
        }
        if (actions[s].action == temp.action) {
            actions[s].action = "noone";
        } else {
            temp = actions[s];
        }
    }
    actions = actions.filter((res) => res.action != "noone");

    // Отделяем материалы и сводим их
    let materials = [];
    actions.forEach((act) => {
        act.materials.forEach((actMat) => {
            const currentMaterial = materialsBase.find((mat) => mat.key == actMat.materialKey);
            const index = materials.findIndex((mat) => mat.name == currentMaterial.name);
            if (typeof actMat.count == "string") actMat.count = +actMat.count.replace(",", ".");
            if (index == -1) {
                materials.push({ name: currentMaterial.name, unit: currentMaterial.unit, count: +actMat.count.toString().replace(",", ".") });
            } else {
                materials[index].count += +actMat.count;
            }
        });
    });

    // Добавляем в первую позицию массивов метку шаблона
    let PKI_name = materials.map((mat) => mat.name);
    PKI_name.unshift("PKI_name");
    let PKI_unit = materials.map((mat) => mat.unit);
    PKI_unit.unshift("PKI_unit");
    let PKI_count = materials.map((mat) => round(+mat.count).toString().replace(".", ","));
    PKI_count.unshift("PKI_count");

    const actNums = actions.map((act) => "{num}" + act.index.toString().slice(0, 2));
    actNums.unshift("actNums");


    if (currentDevice.divided) {
        actions = actions.map((act) => {
            return act.action;
        });
    } else {
        let newActions = [];
        actions.forEach((action) => {
            console.log(action)
            if (newActions[+action.index.slice(0, 2) - 1]) {
                newActions[+action.index.slice(0, 2) - 1] = newActions[+action.index.slice(0, 2) - 1] + " " + action.action;
            } else {
                newActions[+action.index.slice(0, 2) - 1] = action.action;
            }
        });
        actions = newActions;
    }
    actions.unshift("actions");

    // Выделяем заводские номера изделий
    let serialNums = new Map();

    // Для дублированных блоков
    blocksToDouble.forEach((doubl) => {
        doubledBlocks
            .filter((dev) => dev.subDeviceKey == doubl)
            .forEach((dDev, i) => {
                let currentDevice;
                const index = i + 1;
                devicesBase.forEach((dev) => {
                    if (dev.key == dDev.subDeviceKey) currentDevice = dev;
                    dev.includes.forEach((subD) => {
                        if (subD.key == dDev.subDeviceKey) currentDevice = subD;
                    });
                });
                serialNums.set(currentDevice.decimal + "#" + index, dDev.serialNumber);
            });
    });

    // Для всех остальных блоков
    currentDevice.subDevices.forEach((subDev) => {
        let currentDevice;
        devicesBase.forEach((dev) => {
            if (dev.key == subDev.subDeviceKey) currentDevice = dev;
            dev.includes.forEach((subD) => {
                if (subD.key == subDev.subDeviceKey) currentDevice = subD;
            });
        });
        serialNums.set(currentDevice.decimal, subDev.serialNumber);
    });

    await new Promise((resolve, reject) => {
        XLSX.fromFileAsync(actionBlankPath).then((doc) => {
            const sheet = doc.sheet(0);
            for (let d of data) {
                sheet.find("{" + d[0] + "}", (replace) => d[1]);
            }
            if (currentDevice.divided) {
                [actions, PKI_name, PKI_unit, PKI_count, actNums].forEach((arr) => {
                    const placeholder = "{" + arr[0] + "}";
                    let num;
                    for (let i = 1; i < arr.length; i++) {
                        num = i <= 9 ? "0" + i.toString() : i;
                        sheet.find(placeholder + num, (replace) => arr[i]);
                    }
                });
            } else {
                [actions, PKI_name, PKI_unit, PKI_count].forEach((arr) => {
                    const placeholder = "{" + arr[0] + "}";
                    let num;
                    for (let i = 1; i < arr.length; i++) {
                        num = i <= 9 ? "0" + i.toString() : i;
                        sheet.find(placeholder + num, (replace) => arr[i]);
                    }
                });
                let placeholder;
                for (let n = 1; n < 100; n++) {
                    placeholder = "{actNums}" + (n < 10 ? "0" + n : n);
                    sheet.find(placeholder, (_) => n);
                }
            }

            let num = 0;
            let cellsToMerge = [];
            let upBorder, dwnBorder, column;
            for (let i = 1; i < 50; i++) {
                num = i <= 9 ? "0" + i.toString() : i;
                cellsToMerge = sheet.find("{num}" + num);
                if (cellsToMerge.length == 0) continue;
                column = cellsToMerge[0].columnNumber();
                upBorder = Math.min(...cellsToMerge.map((cell) => cell.rowNumber()));
                dwnBorder = Math.max(...cellsToMerge.map((cell) => cell.rowNumber()));
                let rangeToMerge = sheet.range(upBorder, column, dwnBorder, column);
                rangeToMerge.merged(true);
                sheet.find("{num}" + num, (_) => +num);
            }

            sheet.find("{actions}").forEach((cell) => {
                cell.row().hidden(true);
            });
            sheet.find("{PKI_name}").forEach((cell) => {
                cell.row().hidden(true);
            });
            for (let n of serialNums) {
                sheet.find("{" + n[0] + "}", (replace) => n[1]);
            }
            doc.toFileAsync(actionListPath).then((_) => {
                resolve();
            });
        });
    });
    return { actionListPath: actionListPath };
}
