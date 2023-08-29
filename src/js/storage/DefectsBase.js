import { produce } from "immer";
import * as classes from "../classes.js";
import { checkFolder, mergeObjects, saveBase } from "../functions.js";

const fs = require("fs");
const path = require("path");

// Импортируем изначальные настройки программы
const settingsPath = __dirname + "/settings.json";
const initialSettings = JSON.parse(fs.readFileSync(settingsPath));

// Путь к базе дефектов
const defectsBasePath = initialSettings.dataBasePath + "/defectsBase.json";

// Первично читаем БД
const initialDefectsBase = JSON.parse(fs.readFileSync(defectsBasePath));

export const defectsBaseReducer = (state = initialDefectsBase, action) => {
    const index = action.hasOwnProperty("defectKey") ? state.findIndex((def) => def.key == action.defectKey) : undefined;
    const actionIndex = action.hasOwnProperty("actionKey") ? state[index].actions.findIndex((act) => act.key == action.actionKey) : undefined;
    const materalIndex = action.hasOwnProperty("materialKey")
        ? state[index].actions[actionIndex].materials.findIndex((mat) => mat.key == action.materialKey)
        : undefined;

    switch (action.type) {
        case "ADD_DEFECT":
            return produce(state, (draftState) => {
                draftState.push(new classes.defectItem(action.deviceKey, action.solution, action.description, action.defect));
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "REMOVE_DEFECT":
            return produce(state, (draftState) => {
                draftState = state.filter((def) => def.key != action.defectKey);
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "EDIT_DEFECT":
            return produce(state, (draftState) => {
                draftState[index].deviceKey = action.newDefectData.deviceKey;
                draftState[index].solution = action.newDefectData.solution;
                draftState[index].description = action.newDefectData.description;
                draftState[index].defect = action.newDefectData.defect;
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "ADD_DEFECT_ACTION":
            return produce(state, (draftState) => {
                console.log("Action", action);
                console.log("Class result", new classes.defectAction(action.index, action.action));
                draftState[index].actions.push(new classes.defectAction(action.index, action.action));
                draftState[index].actions = draftState[index].actions.sort((a, b) => {
                    if (a.index < b.index) return -1;
                    if (a.index > b.index) return 1;
                    return 0;
                });
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "ADD_EXISTED_ACTION":
            return produce(state, (draftState) => {
                const { defectKeyLink, actionKeyLink } = action;
                const defLIndex = draftState.findIndex((def) => def.key == defectKeyLink);
                const actLIndex = draftState[defLIndex].actions.findIndex((act) => act.key == actionKeyLink);
                let newAction = { ...draftState[defLIndex].actions[actLIndex] };
                newAction.key = classes.getRandomKey();
                newAction.materials = newAction.materials.map((mat) => {
                    mat.key = classes.getRandomKey();
                    return mat;
                });
                draftState[index].actions.push(newAction);
                draftState[index].actions = draftState[index].actions.sort((a, b) => {
                    if (a.index < b.index) return -1;
                    if (a.index > b.index) return 1;
                    return 0;
                });
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "REMOVE_DEFECT_ACTION":
            return produce(state, (draftState) => {
                draftState[index].actions = draftState[index].actions.filter((act) => act.key != action.actionKey);
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "EDIT_DEFECT_ACTION":
            return produce(state, (draftState) => {
                draftState[index].actions[actionIndex].action = action.newActionData.action;
                draftState[index].actions[actionIndex].index = action.newActionData.index;
                draftState[index].actions = draftState[index].actions.sort((a, b) => {
                    if (a.index < b.index) return -1;
                    if (a.index > b.index) return 1;
                    return 0;
                });
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "ADD_DEFECT_MATERIAL":
            return produce(state, (draftState) => {
                draftState[index].actions[actionIndex].materials.push(new classes.defectMaterial(action.materialKey, action.count));
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "REMOVE_DEFECT_MATERIL":
            return produce(state, (draftState) => {
                draftState[index].actions[actionIndex].materials = draftState[index].actions[actionIndex].materials.filter(
                    (mat) => mat.key != action.materialKey
                );
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "EDIT_DEFECT_MATERIAL":
            return produce(state, (draftState) => {
                draftState[index].actions[actionIndex].materials[materalIndex].count = action.count;
                saveBase(draftState, defectsBasePath, "DEFECTS");
            });
        case "DEFECTS_UPDATE":
            return action.data
        default:
            return state;
    }
};
