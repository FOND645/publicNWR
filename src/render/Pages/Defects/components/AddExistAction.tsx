import { AutoComplete, Form, Spin } from 'antd';
import { SelectHandler } from 'rc-select/lib/Select';
import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { existAction } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { addExitActionQueryBody } from '@src/server/ADDqueries';
import { getResponseHeader } from '@src/globalFunctions';
import { appContext } from '@src/render/context';
import styles from './AddExistAction.module.css';

type props = {
    defectID: number;
};

function getExistActions(defectID: number) {
    return new Promise<existAction[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'existBlockActions',
            targetID: defectID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<existAction[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const AddExistAction: FC<props> = ({ defectID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_exitsts_blocks_actions${defectID}`,
        () => getExistActions(defectID),
        { refetchOnWindowFocus: false }
    );

    const [addExistActionForm] = Form.useForm();
    const [options, setOptions] = useState<existAction[]>([]);
    if (appContext.auth.roots === 'watcher') return null;

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const actions = data as existAction[];

    const searching = (text: string) => {
        if (!text) {
            setOptions([]);
        } else {
            setOptions(
                actions.filter((Action) =>
                    Action.label.toLowerCase().includes(text.toLowerCase())
                )
            );
        }
    };

    const addAction: SelectHandler<any, existAction> = (_, option) => {
        const queryBody: addExitActionQueryBody = {
            type: 'add',
            url: 'existAction',
            params: {
                actionID: option.key,
                defectID: defectID,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            form={addExistActionForm}
            className={styles.addExistActionForm}>
            <Form.Item
                name={'field'}
                className={styles.addExistActionFormItem}>
                <AutoComplete
                    className={styles.addExistActionAC}
                    placeholder="Поиск существующих действий..."
                    options={options}
                    onSearch={searching}
                    onSelect={addAction}
                />
            </Form.Item>
        </Form>
    );
};
