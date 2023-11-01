import { readFileSync, watchFile, writeFileSync } from 'fs';
import path from 'path';

export type AppSettings = {
    backUpsFolderPath: string;
    documentsFolderPath: string;
    blanksFolerPath: string;
    enableWebVersion: boolean;
    WebSocketPort: number;
    WebInterfacePort: number;
};

const settingsJSONpath = path.resolve(__dirname, 'settings.json');

const basicSetting: AppSettings = {
    backUpsFolderPath: path.resolve(__dirname, 'backups'),
    blanksFolerPath: path.resolve(__dirname, 'blanks'),
    documentsFolderPath: path.resolve(__dirname, 'documents'),
    enableWebVersion: false,
    WebSocketPort: 7421,
    WebInterfacePort: 8080,
};

const getSettingsJSON = () => {
    try {
        return JSON.parse(
            readFileSync(settingsJSONpath).toString()
        ) as AppSettings;
    } catch (error) {
        writeFileSync(settingsJSONpath, JSON.stringify(basicSetting));
        return basicSetting;
    }
};

export let settings = getSettingsJSON();

type TnewSettings = {
    [k in keyof AppSettings]?: AppSettings[k];
};

export const setSettings = (newSettings: TnewSettings) => {
    const newObject = Object.assign(basicSetting, newSettings);
    writeFileSync(settingsJSONpath, JSON.stringify(newObject));
};

watchFile(settingsJSONpath, () => {
    settings = JSON.parse(
        readFileSync(settingsJSONpath).toString()
    ) as AppSettings;
});
