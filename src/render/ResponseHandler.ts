import { WebSocketMessage, WebSocketResponse } from '@src/server/server';

import { dispatchMessage } from './Pages/PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { qureyClient } from '.';

export function responseHandler(data: MessageEvent<string>) {
    const rawResponse = JSON.parse(data.data);
    if (rawResponse.type === 'get') {
        const inputData = rawResponse as WebSocketResponse<unknown>;
        const { url, response, targetID } = inputData;
        const event = new CustomEvent<unknown>(
            `get_${url}${targetID ? `_${targetID}` : ''}_response`,
            { detail: response }
        );
        document.dispatchEvent(event);
    } else if (rawResponse.type === 'DBupdated') {
        qureyClient
            .getQueryCache()
            .findAll()
            .forEach((Query) => {
                if (Query.queryKey.toString().startsWith('database')) {
                    qureyClient.invalidateQueries(Query.queryKey, {
                        refetchInactive: false,
                    });
                }
            });
    } else if (rawResponse.type === 'error') {
    } else if (rawResponse.type === 'message') {
        const messageBody = rawResponse as WebSocketMessage;
        dispatchMessage({
            type: messageBody.icon,
            content: messageBody.text,
            duration: VALIDATION_MESSAGE_DURATION,
        });
    }
}

export function dataListner<T>(resolve: (value: T) => void, eventName: string) {
    function listner(event: CustomEventInit<T>) {
        const response = event.detail as T;
        console.log(
            `Получен ответ от сервера.\nЗаголовок: ${eventName}\nОтвет:`,
            response
        );
        document.removeEventListener(eventName, listner);
        resolve(response);
    }
    return listner;
}
