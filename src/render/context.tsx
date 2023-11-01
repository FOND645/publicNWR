import { copyFileSync, readFileSync } from 'fs-extra';
import path from 'path';
import { fileAvailable } from '@src/globalFunctions';

export type TAppContext = {
    isElectron: boolean;
    auth: {
        status: boolean;
        roots?: 'admin' | 'editor' | 'watcher';
    };
    settings?: {
        blankPath: string;
        documentsPath: string;
        serverIP: string;
        serverWSport: number;
    };
};

const isElectron = () => {
    try {
        return Boolean(process);
    } catch (error) {
        return false;
    }
};

const defaultSettingsPath = path.resolve(__dirname, 'settings.json');
const settingsPath = path.resolve(__dirname, '..', 'settings.json');

function readSettings(): TAppContext['settings'] {
    if (!isElectron) return undefined;
    if (!fileAvailable(settingsPath))
        copyFileSync(defaultSettingsPath, settingsPath);
    const settings = JSON.parse(
        readFileSync(settingsPath).toString()
    ) as TAppContext['settings'];
    return settings;
}

export const appContext: TAppContext = {
    isElectron: isElectron(),
    auth: {
        status: false,
    },
    settings: readSettings(),
};

interface editAuth {
    (auth: TAppContext['auth']): TAppContext['auth'];
}

export const setAuth = (auth: editAuth | TAppContext['auth']) => {
    if (typeof auth === 'function') {
        appContext.auth = auth(JSON.parse(JSON.stringify(appContext.auth)));
    } else {
        appContext.auth = auth;
    }
};

interface editSettings {
    (settings: TAppContext['settings']): TAppContext['settings'];
}

export const editSettings = (
    settings: editSettings | TAppContext['settings']
) => {
    if (typeof settings === 'function') {
        appContext.settings = settings(
            JSON.parse(JSON.stringify(appContext.settings))
        );
    } else {
        appContext.settings = settings;
    }
};
