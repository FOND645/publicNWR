import { combineReducers, createStore } from "redux";
import { connect } from "react-redux";
import { checkFolder, formatDate, saveBase } from "../functions.js";

const path = require("path");
const fs = require("fs");

const UPDATE_INTERVAL = 50;

// -------------------------------------------------------------------------------
// -------------------------Создаем хранилище STATE-------------------------------
// --------------------------------SETTINGS---------------------------------------
const settingsPath = __dirname + "/settings.json";
const initialSettings = JSON.parse(fs.readFileSync(settingsPath));

// Пути к базам
const contractsPath = initialSettings.dataBasePath + "/contracts.json";
const devicesBasePath = initialSettings.dataBasePath + "/devicesBase.json";
const defectsBasePath = initialSettings.dataBasePath + "/defectsBase.json";
const materialsBasePath = initialSettings.dataBasePath + "/materialsBase.json";
const unitContractsBasePath = initialSettings.dataBasePath + "/unitContracts.json";

// Время изменения баз
let contractBaseTime = fs.statSync(contractsPath).mtimeMs;
let deviceBaseTime = fs.statSync(devicesBasePath).mtimeMs;
let defectBaseTime = fs.statSync(defectsBasePath).mtimeMs;
let materialsBaseTime = fs.statSync(materialsBasePath).mtimeMs;
let unitContractsBaseTime = fs.statSync(unitContractsBasePath).mtimeMs;

// Проверяем существование папок базы, бланков в ней и документов
[initialSettings.documentsBasePath, initialSettings.dataBasePath + "/blanks"].forEach((folder) => checkFolder(folder));

const settingsReducer = (state = initialSettings, action) => {
    switch (action.type) {
        case "SET_DATA_BASE_PATH":
            state.dataBasePath = action.path;
            saveBase(state, settingsPath);
            return state;
        case "SET_DOCUMENTS_BASE_PATH":
            state.documentsBasePath = action.path;
            saveBase(state, settingsPath);
            return state;
        default:
            return state;
    }
};

import { contractsReducer } from "./Contracts";
import { devicesBaseReducer } from "./DevicesBase";
import { defectsBaseReducer } from "./DefectsBase";
import { materialsBaseReducer } from "./Materials";
import { unitContractsReducer } from "./UnitContracts.js";

// Создаем корневой reducer
const rootReducer = combineReducers({
    settings: settingsReducer,
    contracts: contractsReducer,
    unitContracts: unitContractsReducer,
    devicesBase: devicesBaseReducer,
    defectsBase: defectsBaseReducer,
    materialsBase: materialsBaseReducer,
});

// Готовый store для экспорта
export const store = createStore(rootReducer);

let stateProps = (state) => {
    return {
        settings: state.settings,
        contracts: state.contracts,
        devicesBase: state.devicesBase,
        defectsBase: state.defectsBase,
        materialsBase: state.materialsBase,
        unitContracts: state.unitContracts
    };
};

export const dispatchProps = (dispatch) => {
    return {
        // Диспатчи к настройкм
        setDataBasePath: (path) =>
            dispatch({ type: "SET_DATA_BASE_PATH", path }),
        setDocumentsBasePath: (path) =>
            dispatch({ type: "SET_DOCUMENTS_BASE_PATH", path }),

        // Диспатчи к контрактам
        removeContract: (contractKey) =>
            dispatch({ type: "REMOVE_CONTRACT", contractKey }),
        addContract: (organizationName, contractDate, contractNumber) =>
            dispatch({ type: "ADD_CONTRACT", organizationName, contractDate, contractNumber }),
        editContract: (contractKey, newContractData) =>
            dispatch({ type: "EDIT_CONTRACT", contractKey, newContractData }),
        addRepairDevice: (contractKey, repairDeviceKey, serialNumber, repairNumber) =>
            dispatch({ type: "ADD_REPAIR_DEVICE", contractKey, repairDeviceKey, serialNumber, repairNumber }),
        setDivider: (contractKey, repairDeviceKey, divided) =>
            dispatch({ type: "SET_DIVIDER", contractKey, repairDeviceKey, divided }),
        editRepairDevice: (contractKey, repairDeviceKey, newDeviceData) =>
            dispatch({ type: "EDIT_REPAIR_DEVICE", contractKey, repairDeviceKey, newDeviceData }),
        removeRepairDevice: (contractKey, repairDeviceKey) =>
            dispatch({ type: "REMOVE_REPAIR_DEVICE", contractKey, repairDeviceKey }),
        addRepairNote: (contractKey, repairDeviceKey, text) =>
            dispatch({ type: "ADD_REPAIR_NOTE", contractKey, repairDeviceKey, text }),
        editRepairNote: (contractKey, repairDeviceKey, noteKey, text) =>
            dispatch({ type: "EDIT_REPAIR_NOTE", contractKey, repairDeviceKey, noteKey, text }),
        removeRepairNote: (contractKey, repairDeviceKey, noteKey) =>
            dispatch({ type: "REMOVE_REPAIR_NOTE", contractKey, repairDeviceKey, noteKey }),
        addRepairSubDevice: (contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count) =>
            dispatch({ type: "ADD_REPAIR_SUBDEVICE", contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count }),
        editRepairSubDevice: (contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count) =>
            dispatch({ type: "EDIT_REPAIR_SUBDEVICE", contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count }),
        removeRepairSubDevice: (contractKey, repairDeviceKey, repairSubDeviceKey) =>
            dispatch({ type: "REMOVE_REPAIR_SUBDEVICE", contractKey, repairDeviceKey, repairSubDeviceKey }),
        addRepairDefect: (contractKey, repairDeviceKey, repairSubDeviceKey, defectKey) =>
            dispatch({ type: "ADD_REPAIR_DEFECT", contractKey, repairDeviceKey, repairSubDeviceKey, defectKey }),
        removeRepairDefect: (contractKey, repairDeviceKey, repairSubDeviceKey, defectKey) =>
            dispatch({ type: "REMOVE_REPAIR_DEFECT", contractKey, repairDeviceKey, repairSubDeviceKey, defectKey }),

        // Диспатчи к БД устройств
        addDevice: (name, decimal) =>
            dispatch({ type: "ADD_DEVICE", name, decimal }),
        removeDevice: (deviceKey) =>
            dispatch({ type: "REMOVE_DEVICE", deviceKey }),
        editDevice: (deviceKey, newDeviceData) =>
            dispatch({ type: "EDIT_DEVICE", deviceKey, newDeviceData }),
        addSubDevice: (deviceKey, name, decimal) =>
            dispatch({ type: "ADD_SUBDEVICE", deviceKey, name, decimal }),
        removeSubDevice: (deviceKey, subDeviceKey) =>
            dispatch({ type: "REMOVE_SUBDEVICE", deviceKey, subDeviceKey }),
        editSubDevice: (deviceKey, subDeviceKey, newSubDeviceData) =>
            dispatch({ type: "EDIT_SUBDEVICE", deviceKey, subDeviceKey, newSubDeviceData }),

        // Диспачти к БД неисправностей
        addDefect: (deviceKey, solution, description, defect) =>
            dispatch({ type: "ADD_DEFECT", deviceKey, solution, description, defect }),
        removeDefect: (defectKey) =>
            dispatch({ type: "REMOVE_DEFECT", defectKey }),
        editDefect: (defectKey, newDefectData) =>
            dispatch({ type: "EDIT_DEFECT", defectKey, newDefectData }),
        addDefectAction: (defectKey, index, action) =>
            dispatch({ type: "ADD_DEFECT_ACTION", defectKey, index, action }),
        addExistDefectAction: (defectKey, defectKeyLink, actionKeyLink) =>
            dispatch({ type: "ADD_EXISTED_ACTION", defectKey, defectKeyLink, actionKeyLink }),
        removeDefectAction: (defectKey, actionKey) =>
            dispatch({ type: "REMOVE_DEFECT_ACTION", defectKey, actionKey }),
        editDefectAction: (defectKey, actionKey, newActionData) =>
            dispatch({ type: "EDIT_DEFECT_ACTION", defectKey, actionKey, newActionData }),
        addDefectMaterial: (defectKey, actionKey, materialKey, count) =>
            dispatch({ type: "ADD_DEFECT_MATERIAL", defectKey, actionKey, materialKey, count }),
        removeDefectMaterial: (defectKey, actionKey, materialKey) =>
            dispatch({ type: "REMOVE_DEFECT_MATERIL", defectKey, actionKey, materialKey }),
        editDefectMaterial: (defectKey, actionKey, materialKey, count) =>
            dispatch({ type: "EDIT_DEFECT_MATERIAL", defectKey, actionKey, materialKey, count }),

        // Диспатчи к БД материалов
        addMaterial: (name, unit) =>
            dispatch({ type: "ADD_MATERIAL", name, unit }),
        editMaterial: (matKey, name, unit) =>
            dispatch({ type: "EDIT_MATERIAL", matKey, name, unit }),
        removeMaterial: (matKey) =>
            dispatch({ type: "REMOVE_MATERIAL", matKey }),

        // Диспатчи к единичным договорам
        addUnitDevice: (deviceKey, serialNumber, repairNumber, organizationName, organizationCity) =>
            dispatch({ type: "ADD_UNIT_DEVICE", deviceKey, serialNumber, repairNumber, organizationName, organizationCity }),
        removeUnitDevice: (deviceKey) =>
            dispatch({ type: "REMOVE_UNIT_DEVICE", deviceKey }),
        editUnitDevice: (deviceKey, newDeviceData) =>
            dispatch({ type: "EDIT_UNIT_DEVICE", deviceKey, newDeviceData }),
        addUnitRepairNote: (deviceKey, text) =>
            dispatch({ type: "ADD_UNIT_REPAIR_NOTE", deviceKey, text }),
        editUnitRepairNote: (deviceKey, noteKey, text) =>
            dispatch({ type: "EDIT_UNIT_REPAIR_NOTE", deviceKey, noteKey, text }),
        removeUnitRepairNote: (deviceKey, text) =>
            dispatch({ type: "EDIT_UNIT_REPAIR_NOTE", deviceKey, text }),
        addUnitReparSubDevice: (deviceKey, subDeviceKey, serialNumber, count) =>
            dispatch({ type: "ADD_UNIT_REPAIR_SUBDEVICE", deviceKey, subDeviceKey, serialNumber, count }),
        editUnitRepairSubDevice: (deviceKey, subDeviceKey, serialNumber, count) =>
            dispatch({ type: "EDIT_UNIT_REPAIR_SUBDEVICE", deviceKey, subDeviceKey, serialNumber, count }),
        removeUnitRepairSubDevice: (deviceKey, subDeviceKey) =>
            dispatch({ type: "REMOVE_UNIT_REPAIR_SUBDEVICE", deviceKey, subDeviceKey }),
        addUnitRepairDefect: (deviceKey, subDeviceKey, defectKey) =>
            dispatch({ type: "ADD_UNIT_REPAIR_DEFECT", deviceKey, subDeviceKey, defectKey }),
        removeUnitRepairDefect: (deviceKey, subDeviceKey, defectKey) =>
            dispatch({ type: "REMOVE_UNIT_REPAIR_DEFECT", deviceKey, subDeviceKey, defectKey }),
        addUnitRepairProgress: (deviceKey, event, date) => 
            dispatch({type: "ADD_UNIT_REPAIR_PROGRESS", deviceKey, event, date}),
        removeUnitRepairProgress: (deviceKey, eventKey) => 
            dispatch({type: "REMOVE_UNIT_REPAIR_PROGRESS", deviceKey, eventKey}),
        editUnitRepairProgress: (deviceKey, eventKey, eventData) => 
            dispatch({type: "EDIT_UNIT_REPAIR_PROGRESS", deviceKey, eventKey, eventData})

    };
};

watcher();
// Функция включения отслеживания изменений в файле
async function watcher() {
    let bases = [
        { type: "CONTRACTS", pth: contractsPath, time: contractBaseTime },
        { type: "DEVICES", pth: devicesBasePath, time: deviceBaseTime },
        { type: "DEFECTS", pth: defectsBasePath, time: defectBaseTime },
        { type: "MATREIALS", pth: materialsBasePath, time: materialsBaseTime },
        { type: "UNIT_CONTRACTS", pth: unitContractsBasePath, time: unitContractsBaseTime },
    ];
    setInterval(() => {
        bases = bases.map((base) => {
            const newTime = fs.statSync(base.pth).mtimeMs;
            if (newTime != base.time) {
                console.log("Файл", base.pth, "изменился.");
                console.log("Время старой базы", formatDate(new Date(base.time)), ". Новой", formatDate(new Date(newTime)));
                store.dispatch({ type: base.type + "_UPDATE", data: JSON.parse(fs.readFileSync(base.pth)) });
                return { type: base.type, pth: base.pth, time: newTime };
            } else return base;
        });
    }, UPDATE_INTERVAL);
}

export const containerShell = connect(stateProps, dispatchProps);
