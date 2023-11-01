import { Button, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { block, selectOption } from '@src/server/GETqueries';
import { addRepairBlockBoyQuery } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import { appContext } from '@src/render/context';
import styles from './AddBlock.module.css';

type props = {
    repairDeviceID: number;
};

function getBlocks(repairDeviceID: number) {
    return new Promise<block[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'deviceBlocks',
            targetID: repairDeviceID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<block[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const AddBlock: FC<props> = ({ repairDeviceID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_devices_blocks_${repairDeviceID}`,
        () => getBlocks(repairDeviceID),
        { refetchOnWindowFocus: false }
    );

    const [addSubDeviceForm] = Form.useForm();
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

    const addBlock: React.MouseEventHandler<HTMLElement> = () => {
        const blockID: number | undefined =
            addSubDeviceForm.getFieldValue('blockID');
        const count: number | undefined =
            addSubDeviceForm.getFieldValue('count');
        const serialNumber: string =
            addSubDeviceForm.getFieldValue('serialNumber') || 'б/н';
        if (blockID === undefined || count === undefined) {
            dispatchMessage({
                type: 'error',
                content: 'Укажите блок и количество',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addRepairBlockBoyQuery = {
            type: 'add',
            url: 'repairBlock',
            params: {
                blockID: blockID,
                count: count,
                serialNumber: serialNumber,
                repairDeviceID: repairDeviceID,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    const options: selectOption[] = data.map((BLock) => {
        return {
            label: BLock.name,
            value: BLock.id,
            key: BLock.id,
        };
    });

    return (
        <Form
            form={addSubDeviceForm}
            className={styles.AddBlockForm}>
            <Space.Compact
                direction={'horizontal'}
                className={styles.AddBlockContainer}>
                <Form.Item
                    name={'blockID'}
                    className={styles.AddBlockFormItemBlock}>
                    <Select
                        className={styles.AddBlockSelect}
                        options={options}
                        placeholder={'Выберите блок'}
                    />
                </Form.Item>
                <Form.Item
                    name={'count'}
                    initialValue={1}
                    className={styles.AddBlockFormItemCount}
                    id={styles.AddBlockCountFormItem}>
                    <InputNumber
                        min={0}
                        className={styles.AddBlockInputNumber}
                    />
                </Form.Item>
                <Form.Item
                    name={'serialNumber'}
                    className={styles.AddBlockFormItemSerialNumber}
                    id={styles.AddBlockSerialNumberFormItem}>
                    <Input
                        placeholder={'Зав. №'}
                        className={styles.AddBlockInputNumber}
                    />
                </Form.Item>
                <Button
                    className={styles.AddBlockButton}
                    onClick={addBlock}>
                    Добавить блок
                </Button>
            </Space.Compact>
        </Form>
    );
};
