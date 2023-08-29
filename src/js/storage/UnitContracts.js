import * as classes from "../classes.js";
import { checkFolder, progressEventsSorter, saveBase } from "../functions.js";
import { produce } from "immer";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");

// Импортируем изначальные настройки программы
const settingsPath = __dirname + "/settings.json";
const initialSettings = JSON.parse(fs.readFileSync(settingsPath));
const { dataBasePath, documentsBasePath } = initialSettings;

// Путь к базе контрактов
const unitContractsPath = dataBasePath + "/unitContracts.json";

// Первично читаем БД
const initialUnitContracts = JSON.parse(fs.readFileSync(unitContractsPath));

const unitContractDocumentsPath = path.resolve(documentsBasePath, "unitContracts");

[unitContractDocumentsPath].forEach((folder) => checkFolder(folder));

export const unitContractsReducer = (state = initialUnitContracts, action) => {
    const deviceIndex = action.hasOwnProperty("deviceKey") ? state.find((device) => device.key == action.deviceKey) : undefined;

    const subDevIndex = action.hasOwnProperty("repairSubDeviceKey")
        ? state[deviceIndex].subDevices.findIndex((subDev) => subDev.key == action.repairSubDeviceKey)
        : undefined;

    const noteIndex = action.hasOwnProperty("noteKey")
        ? state[deviceIndex].notes.findIndex((note) => note.key == action.noteKey)
        : undefined;

    const eventIndex = action.hasOwnProperty("eventKey")
        ? state[deviceIndex].progress.findIndex(event => event.key == action.eventKey)
        : undefined

    switch (action.type) {
        // Устройства
        case "ADD_UNIT_DEVICE":
            return produce(state, (draftState) => {
                const newDevice = new classes.unitReapirDevice(
                    action.deviceKey,
                    action.serialNumber,
                    action.repairNumber,
                    action.organizationName,
                    action.organizationCity
                )
                draftState.push(newDevice);
                [
                    path.resolve(unitContractDocumentsPath, newDevice.key),
                    path.resolve(unitContractDocumentsPath, newDevice.key, "documents"),
                    path.resolve(unitContractDocumentsPath, newDevice.key, "documents", "mails"),
                    path.resolve(unitContractDocumentsPath, newDevice.key, "documents", "writeUp"),
                    path.resolve(unitContractDocumentsPath, newDevice.key, "documents", "contract"),
                    path.resolve(unitContractDocumentsPath, newDevice.key, "documents", "order"),
                ].forEach(folder => checkFolder(folder))

                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });
        case "REMOVE_UNIT_DEVICE":
            return produce(state, (draftState) => {
                draftState.filter((device) => device.key != action.deviceKey);
                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });
        case "EDIT_UNIT_DEVICE":
            return produce(state, (draftState) => {
                draftState[deviceIndex] = { ...draftState[deviceIndex], ...action.newDeviceData };
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });

        // Примечания
        case "ADD_UNIT_REPAIR_NOTE":
            return produce(state, (draftState) => {
                draftState[deviceIndex].notes.push(new classes.repairNote(action.text, action.deviceKey));
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });
        case "EDIT_UNIT_REPAIR_NOTE":
            return produce(state, (draftState) => {
                draftState[deviceIndex].notes[noteIndex].text = action.text;
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });
        case "REMOVE_UNIT_REPAIR_NOTE":
            return produce(state, (draftState) => {
                draftState[deviceIndex].notes = draftState[deviceIndex].notes.filter((note) => note.key != action.noteKey);
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });

        // Блоки
        case "ADD_UNIT_REPAIR_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[deviceIndex].subDevices = [
                    ...draftState[deviceIndex].subDevices,
                    new classes.repairSubDevice(action.subDeviceKey, action.serialNumber, action.deviceKey, action.count),
                ];
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });
        case "EDIT_UNIT_REPAIR_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[deviceIndex].subDevices[subDevIndex].serialNumber = action.serialNumber;
                draftState[deviceIndex].subDevices[subDevIndex].count = action.count;
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "UNIT_CONTRACTS");
            });
        case "REMOVE_UNIT_REPAIR_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[deviceIndex].subDevices = draftState[deviceIndex].subDevices.filter((subDev) => subDev.key != action.subDeviceKey);
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "CONTRACTS");
            });

        // Дефекты
        case "ADD_UNIT_REPAIR_DEFECT":
            return produce(state, (draftState) => {
                draftState[deviceIndex].subDevices[subDevIndex].defects.push(action.defectKey);
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "CONTRACTS");
            });
        case "REMOVE_UNIT_REPAIR_DEFECT":
            return produce(state, (draftState) => {
                draftState[deviceIndex].subDevices[subDevIndex].defects = draftState[contractIndex].repairBase[devIndex].subDevices[
                    subDevIndex
                ].defects.filter((def) => def != action.defectKey);
                draftState[deviceIndex].changeTime = Date.now();
                saveBase(draftState, unitContractsPath, "CONTRACTS");
            });

        // Прогресс
        case "ADD_UNIT_REPAIR_PROGRESS":
            return produce(state, (draftState) => {
                draftState[deviceIndex].progress.push(new classes.progressEvent(action.event, action.date))
                draftState[deviceIndex].progress.sort(progressEventsSorter)
                saveBase(draftState, unitContractsPath, "CONTRACTS");
            });
        case "REMOVE_UNIT_REPAIR_PROGRESS":
            return produce(state, (draftState) => {
                draftState[deviceIndex].progress.filter(event => event.key != action.eventKey)
                saveBase(draftState, unitContractsPath, "CONTRACTS");
            });
        case "EDIT_UNIT_REPAIR_PROGRESS":
            return produce(state, (draftState) => {
                draftState[deviceIndex].progress[eventIndex] = { ...draftState[deviceIndex].progress[eventIndex], ...action.eventData }
                draftState[deviceIndex].progress.sort(progressEventsSorter)
                saveBase(draftState, unitContractsPath, "CONTRACTS");
            });
        case "UNIT_CONTRACTS_UPDATE":
            return action.data;
        default:
            return state;
    }
}
