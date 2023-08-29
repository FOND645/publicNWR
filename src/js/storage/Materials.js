import { produce } from "immer";
import * as classes from "../classes.js";
import { checkFolder, mergeObjects, saveBase } from "../functions.js";

const fs = require("fs");
const path = require("path");
const lodash = require("lodash");

// Импортируем изначальные настройки программы
const settingsPath = __dirname + "/settings.json";
const initialSettings = JSON.parse(fs.readFileSync(settingsPath));

// Путь к базе материалов
const materialsBasePath = initialSettings.dataBasePath + "/materialsBase.json";

// Первично читаем БД
const initialMaterialsBase = JSON.parse(fs.readFileSync(materialsBasePath));

export const materialsBaseReducer = (state = initialMaterialsBase, action) => {
    const index = action.hasOwnProperty("matKey") ? state.findIndex((materal) => materal.key == action.matKey) : undefined;

    switch (action.type) {
        case "ADD_MATERIAL":
            return produce(state, (draftState) => {
                draftState.push(new classes.material(action.name, action.unit));
                saveBase(draftState, materialsBasePath, "MATERIALS");
            });
        case "EDIT_MATERIAL":
            return produce(state, (draftState) => {
                draftState[index].name = action.name;
                draftState[index].unit = action.unit;
                saveBase(draftState, materialsBasePath, "MATERIALS");
            });
        case "REMOVE_MATERIAL":
            return produce(state, (draftState) => {
                draftState.splice(index, 1);
                saveBase(draftState, materialsBasePath, "MATERIALS");
            });
        case "MATERIALS_UPDATE":
            return action.data
        default:
            return state;
    }
};
