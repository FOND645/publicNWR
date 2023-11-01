import { AutoComplete, Button, Form, Input, Space, Spin } from 'antd';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { addActionToDefectQueryBody } from '@src/server/ADDqueries';
import { getResponseHeader } from '@src/globalFunctions';
import { appContext } from '@src/render/context';
import styles from './AddNewAction.module.css';

type props = {
    defectID: number;
};

function getRelevantActions(defectID: number) {
    return new Promise<{ value: string }[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'blockActions',
            targetID: defectID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<{ value: string }[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const AddNewAction: FC<props> = ({ defectID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_blocks_actions_${defectID}`,
        () => getRelevantActions(defectID),
        { refetchOnWindowFocus: false }
    );

    const [addActionForm] = Form.useForm();
    const [options, setOptions] = useState<{ value: string }[]>([]);
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

    const actionOptions = data as { value: string }[];

    function searching(text: string) {
        if (!text) {
            setOptions([]);
            return;
        }
        setOptions(
            actionOptions.filter((Option) =>
                Option.value.toLowerCase().includes(text.toLowerCase())
            )
        );
    }

    const addNewAction: React.MouseEventHandler<HTMLElement> = (_) => {
        const index = addActionForm.getFieldValue('index');
        const action = addActionForm.getFieldValue('action');
        if (!index || !action) {
            dispatchMessage({
                type: 'error',
                content: 'Индекс и действие не могут быть пустыми',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addActionToDefectQueryBody = {
            type: 'add',
            url: 'action',
            params: {
                action: action.trim(),
                defectID: defectID,
                index: index.trim(),
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            form={addActionForm}
            className={styles.AddNewActionForm}>
            <Space.Compact
                block
                className={styles.AddNewActionContainer}
                direction={'horizontal'}>
                <Form.Item
                    name={'index'}
                    className={styles.AddNewActionFormIndexItem}>
                    <Input
                        placeholder="Индекс"
                        className={styles.AddNewActionInput}
                    />
                </Form.Item>
                <Form.Item
                    name={'action'}
                    className={styles.AddNewActionFormInputItem}>
                    <AutoComplete
                        onSearch={searching}
                        options={options}
                        placeholder="Введите новое действие"
                        className={styles.AddNewActionInput}
                    />
                </Form.Item>
                <Button
                    onClick={addNewAction}
                    className={styles.AddNewActionButton}>
                    Добавить новое действие
                </Button>
            </Space.Compact>
        </Form>
    );
};
