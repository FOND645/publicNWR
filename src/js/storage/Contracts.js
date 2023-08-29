import * as classes from "../classes.js";
import { checkFolder, mergeObjects, saveBase } from "../functions.js";
import { produce } from "immer";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");

// Импортируем изначальные настройки программы
const settingsPath = __dirname + "/settings.json";
const initialSettings = JSON.parse(fs.readFileSync(settingsPath));

// Путь к базе контрактов
const contractsPath = initialSettings.dataBasePath + "/contracts.json";

// Первично читаем БД
const initialContracts = JSON.parse(fs.readFileSync(contractsPath));

// Проверяем существуют ли в папке documentsBasePath папки для контрактов, дефектовок и перечней и если нет, то создаем их.
let contractPathsNames = [];
initialContracts.forEach((contr) => {
    const contrPath = path.resolve(initialSettings.documentsBasePath, contr.key);
    contractPathsNames.push(contrPath);
    contractPathsNames.push(contrPath + "/Карты дефектации");
    contractPathsNames.push(contrPath + "/Перечни выполненых работ");
    contractPathsNames.push(initialSettings.dataBasePath + "/blanks/" + contr.key);
});
contractPathsNames.forEach((folder) => checkFolder(folder));

export const contractsReducer = (state = initialContracts, action) => {
    // Ищем индекс контракта по его ключу
    const contractIndex = action.hasOwnProperty("contractKey") ? state.findIndex((contr) => contr.key == action.contractKey) : undefined;

    // Ищем индекс устройства по его ключу
    const devIndex = action.hasOwnProperty("repairDeviceKey")
        ? state[contractIndex].repairBase.findIndex((dev) => dev.key == action.repairDeviceKey)
        : undefined;

    // Ищем индекс блока по его ключу
    const subDevIndex = action.hasOwnProperty("repairSubDeviceKey")
        ? state[contractIndex].repairBase[devIndex].subDevices.findIndex((subDev) => subDev.key == action.repairSubDeviceKey)
        : undefined;

    // Ищем индекс примечания по его ключу
    const noteIndex = action.hasOwnProperty("noteKey")
        ? state[contractIndex].repairBase[devIndex].notes.findIndex((note) => note.key == action.noteKey)
        : undefined;

    switch (action.type) {
        // Контракты
        case "REMOVE_CONTRACT":
            return produce(state, (draftState) => {
                draftState = draftState.filter((contr) => contr.key != action.contractKey);
                saveBase(state, contractsPath, "CONTRACTS");
            });
        case "ADD_CONTRACT":
            return produce(state, (draftState) => {
                draftState.push(new classes.Contract(action.organizationName, action.contractDate, action.contractNumber));
                const newContractKey = draftState[draftState.length - 1].key;
                const contrPath = initialSettings.documentsBasePath + "/" + newContractKey;
                [
                    contrPath,
                    contrPath + "/Карты дефектации",
                    contrPath + "/Перечни выполненых работ",
                    initialSettings.dataBasePath + "/blanks/" + newContractKey,
                ].forEach((folder) => checkFolder(folder));

                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "EDIT_CONTRACT":
            return produce(state, (draftState) => {
                draftState[contractIndex].organizationName = action.newContractData.organizationName;
                draftState[contractIndex].contractNumber = action.newContractData.contractNumber;
                draftState[contractIndex].contractDate = action.newContractData.contractDate;
                saveBase(draftState, contractsPath, "CONTRACTS");
            });

        // Устройства в ремонте
        case "ADD_REPAIR_DEVICE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase = [
                    ...draftState[contractIndex].repairBase,
                    new classes.repairDevice(action.repairDeviceKey, action.serialNumber, action.repairNumber),
                ];
                draftState[contractIndex].repairBase = draftState[contractIndex].repairBase.sort((a, b) => {
                    if (a.deviceKey < b.deviceKey) return -1;
                    else if (a.deviceKey > b.deviceKey) return 1;
                    else {
                        if (+a.repairNumber < +b.repairNumber) return -1;
                        else if (+a.repairNumber > +b.repairNumber) return 1;
                        else return 0;
                    }
                });

                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "EDIT_REPAIR_DEVICE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].repairNumber = action.newDeviceData.repairNumber;
                draftState[contractIndex].repairBase[devIndex].serialNumber = action.newDeviceData.serialNumber;
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                draftState[contractIndex].repairBase = draftState[contractIndex].repairBase.sort((a, b) => {
                    if (a.deviceKey < b.deviceKey) return -1;
                    else if (a.deviceKey > b.deviceKey) return 1;
                    else {
                        if (+a.repairNumber < +b.repairNumber) return -1;
                        else if (+a.repairNumber > +b.repairNumber) return 1;
                        else return 0;
                    }
                });
                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "REMOVE_REPAIR_DEVICE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase = draftState[contractIndex].repairBase.filter((dev) => dev.key != action.repairDeviceKey);
                saveBase(draftState, contractsPath, "CONTRACTS");
            });

        // Флаг - делить ли перечень на строки
        case "SET_DIVIDER":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].divided = action.divided;
                saveBase(draftState, contractsPath, "CONTRACTS");
            });

        // Примечания к ремонту
        case "ADD_REPAIR_NOTE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].notes.push(new classes.repairNote(action.text, action.repairDeviceKey));
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "EDIT_REPAIR_NOTE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].notes[noteIndex].text = action.text;
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "REMOVE_REPAIR_NOTE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].notes = draftState[contractIndex].repairBase[devIndex].notes.filter(
                    (note) => note.key != action.noteKey
                );
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });

        // Блоки
        case "ADD_REPAIR_SUBDEVICE":
            console.log(state);
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].subDevices = [
                    ...draftState[contractIndex].repairBase[devIndex].subDevices,
                    new classes.repairSubDevice(action.repairSubDeviceKey, action.serialNumber, action.repairDeviceKey, action.count),
                ];
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "EDIT_REPAIR_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].subDevices[subDevIndex].serialNumber = action.serialNumber;
                draftState[contractIndex].repairBase[devIndex].subDevices[subDevIndex].count = action.count;
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "REMOVE_REPAIR_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].subDevices = draftState[contractIndex].repairBase[devIndex].subDevices.filter(
                    (subDev) => subDev.key != action.repairSubDeviceKey
                );
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });

        // Дефекты в блоках
        case "ADD_REPAIR_DEFECT":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].subDevices[subDevIndex].defects.push(action.defectKey);
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "REMOVE_REPAIR_DEFECT":
            return produce(state, (draftState) => {
                draftState[contractIndex].repairBase[devIndex].subDevices[subDevIndex].defects = draftState[contractIndex].repairBase[
                    devIndex
                ].subDevices[subDevIndex].defects.filter((def) => def != action.defectKey);
                draftState[contractIndex].repairBase[devIndex].changeTime = Date.now();
                saveBase(draftState, contractsPath, "CONTRACTS");
            });
        case "CONTRACTS_UPDATE":
            return action.data;
        default:
            return state;
    }
};
