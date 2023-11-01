import { Button, Form, Select, Space, Spin } from 'antd';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { addDefectData } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { addDefectToBlockQueryBody } from '@src/server/ADDqueries';
import { getResponseHeader } from '@src/globalFunctions';
import { appContext } from '@src/render/context';
import styles from './AddDefect.module.css';

type props = {
    repairBlockID: number;
};

function getOptionsAndDefects(repairBlockID: number) {
    return new Promise<addDefectData[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'defectsAllowedToAdd',
            targetID: repairBlockID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<addDefectData[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const AddDefect: FC<props> = ({ repairBlockID }) => {
    const { isError, isLoading, error, data } = useQuery(
        `database_allowed_defects_${repairBlockID}`,
        () => getOptionsAndDefects(repairBlockID),
        { refetchOnWindowFocus: false }
    );

    const [addDefectForm] = Form.useForm();
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

    const addDefect: React.MouseEventHandler<HTMLElement> = () => {
        const defectID: number | undefined =
            addDefectForm.getFieldValue('defectID');
        if (defectID === undefined) {
            dispatchMessage({
                type: 'error',
                content: 'Укажите неисправность',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addDefectToBlockQueryBody = {
            type: 'add',
            url: 'defectToBlock',
            params: {
                defectID: +defectID,
                repairBlockID: repairBlockID,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };
    const filterOption = (
        input: string,
        option?: { label: string; value: string }
    ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    return (
        <Form
            form={addDefectForm}
            className={styles.AddDefectForm}>
            <Space.Compact
                className={styles.AddDefectContainer}
                direction={'horizontal'}>
                <Form.Item
                    name={'defectID'}
                    className={styles.AddDefectFormItem}>
                    <Select
                        showSearch
                        filterOption={filterOption}
                        className={styles.AddDefectSelect}
                        options={data.map((Option) => {
                            return {
                                label: Option.label,
                                value: Option.value.toString(),
                            };
                        })}
                    />
                </Form.Item>
                <Button
                    onClick={addDefect}
                    className={styles.AddDefectButton}>
                    Добавить неисправность
                </Button>
            </Space.Compact>
        </Form>
    );
};
