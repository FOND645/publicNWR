import { produce } from "immer";
import * as classes from "../classes.js";
import { checkFolder, mergeObjects, saveBase } from "../functions.js";

const fs = require("fs");
const path = require("path");

// Импортируем изначальные настройки программы
const settingsPath = __dirname + "/settings.json";
const initialSettings = JSON.parse(fs.readFileSync(settingsPath));

// Путь к базе устройств
const devicesBasePath = initialSettings.dataBasePath + "/devicesBase.json";

// Первично читаем БД
const initialDevicesBase = JSON.parse(fs.readFileSync(devicesBasePath));

export const devicesBaseReducer = (state = initialDevicesBase, action) => {
    const index = action.hasOwnProperty("deviceKey") ? state.findIndex((dev) => dev.key == action.deviceKey) : undefined;
    const subIndex = action.hasOwnProperty("subDeviceKey")
        ? state[index].includes.findIndex((subDev) => subDev.key == action.subDeviceKey)
        : undefined;

    switch (action.type) {
        case "ADD_DEVICE":
            return produce(state, (draftState) => {
                draftState.push(new classes.device(action.name, action.decimal));
                saveBase(draftState, devicesBasePath, "DEVICES");
            })
        case "REMOVE_DEVICE":
            return produce(state, (draftState) => {
                draftState = draftState.filter((dev) => dev.key != action.deviceKey);
                saveBase(draftState, devicesBasePath, "DEVICES");
            })
        case "EDIT_DEVICE":
            return produce(state, (draftState) => {
                draftState[index].name = action.newDeviceData.name;
                draftState[index].decimal = action.newDeviceData.decimal;
                saveBase(draftState, devicesBasePath, "DEVICES");
            })
        case "ADD_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[index].includes.push(new classes.subDevice(action.name, action.decimal, action.deviceKey));
                saveBase(draftState, devicesBasePath, "DEVICES");
            })
        case "REMOVE_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[index].includes = draftState[index].includes.filter((subDev) => subDev.key != action.subDeviceKey);
                saveBase(draftState, devicesBasePath, "DEVICES");
            })
        case "EDIT_SUBDEVICE":
            return produce(state, (draftState) => {
                draftState[index].includes[subIndex].name = action.newSubDeviceData.name;
                draftState[index].includes[subIndex].decimal = action.newSubDeviceData.decimal;
                saveBase(draftState, devicesBasePath, "DEVICES");
            })
        case "DEVICES_UPDATE":
            return action.data
        default:
            return state;
    }
};
