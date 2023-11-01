import fs from 'fs';
import path from 'path';
import { WebSocketRequerst, WebSocketResponse } from './server/server';
import { WebSocket } from 'ws';
import { WebSocketError } from './globalTypes';

export function formatToNumbericTime(inputDate: number) {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // добавляем 1, так как месяцы начинаются с 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// Проверка можно ли удалить папку
export function isFolderAbleToRemove(pathToFolder: string) {
    const fileList = fs.readdirSync(pathToFolder, { withFileTypes: true });
    for (let fileObj of fileList) {
        if (fileObj.isFile()) {
            if (!isFileAbleToRemove(path.resolve(pathToFolder, fileObj.name)))
                return false;
        } else {
            if (!isFolderAbleToRemove(path.resolve(pathToFolder, fileObj.name)))
                return false;
        }
    }
    return true;
}

// Проверка можно ли удалит файл
export function isFileAbleToRemove(filePath: string) {
    let result;
    try {
        fs.accessSync(filePath, fs.constants.W_OK);
        result = true;
    } catch (error) {
        result = false;
    }
    return result;
}

// Проверка существования файла
export function fileAvailable(filePath: string) {
    let result;
    try {
        fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
        result = true;
    } catch (error) {
        result = false;
    }
    return result;
}

// Проверка существования папки
export function folderExists(path: string) {
    try {
        return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
    } catch (err) {
        return false;
    }
}

export const getResponseHeader = (request: WebSocketRequerst) => {
    const header = `get_${request.url}${
        request.targetID ? `_${request.targetID}` : ''
    }_response`;
    // console.log(`Ожидаем заголовок:\n${header}`);
    return header;
};

export function getErrorSender(socket: WebSocket) {
    return function (error: { [key: string]: any }, message?: string): void {
        const response: WebSocketError = {
            type: 'error',
            message: message,
            error: error,
        };
        socket.send(JSON.stringify(response));
    };
}

export function getResponseSender(socket: WebSocket) {
    return function <T>(result: T, request: WebSocketRequerst) {
        const response: WebSocketResponse<T> = {
            type: request.type,
            url: request.url,
            params: request.params,
            targetID: request.targetID,
            response: result,
        };
        // console.log(`Ответ: ${JSON.stringify(result, null, 2)}`);
        socket.send(JSON.stringify(response));
    };
}

export function compareText(text1: string, text2: string): number {
    if (text1 > text2) return 1;
    if (text1 < text2) return -1;
    else return 0;
}
