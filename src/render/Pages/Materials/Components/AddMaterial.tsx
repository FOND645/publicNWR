import { Button, Form, Input, Select, Space, Spin } from 'antd';
import React, { FC } from 'react';
import { unit } from '@src/server/GETqueries';
import { useQuery } from 'react-query';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { addNewMaterialQueryBody } from '@src/server/ADDqueries';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { connection } from '@src/render/root';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { LoadingError } from '../../Common/LoadingError';
import { DefaultOptionType } from 'rc-select/lib/Select';
import { getResponseHeader } from '@src/globalFunctions';
import { appContext } from '@src/render/context';
import styles from './AddMaterial.module.css';

function getUnits() {
    return new Promise<unit[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'materialUnits',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<unit[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const AddMaterial: FC = () => {
    const { data, isError, isLoading, error } = useQuery(
        'database_units',
        getUnits,
        { refetchOnWindowFocus: false }
    );

    const [addMaterialForm] = Form.useForm();
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

    const units: DefaultOptionType[] =
        data?.map((Unit) => {
            return {
                label: Unit.unit,
                value: Unit.unit,
            };
        }) || [];

    const addMaterial: React.MouseEventHandler<HTMLElement> = async () => {
        const name = addMaterialForm.getFieldValue('name') as
            | string
            | undefined;
        const unit = addMaterialForm.getFieldValue('unit') as
            | string
            | undefined;

        if (!name || !unit) {
            dispatchMessage({
                type: 'error',
                content: 'Введите название и единицу измерения материала',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }

        const queryBody: addNewMaterialQueryBody = {
            type: 'add',
            url: 'material',
            params: {
                name: name.trim(),
                unit: unit.trim(),
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            form={addMaterialForm}
            className={styles.AddMaterialForm}>
            <Space.Compact
                direction={'horizontal'}
                className={styles.AddMaterialContainer}>
                <Form.Item
                    name={'name'}
                    className={styles.AddMaterialFormNameItem}>
                    <Input
                        placeholder="Введите название материала"
                        className={styles.AddMaterialInput}
                    />
                </Form.Item>
                <Form.Item
                    name={'unit'}
                    id={styles.AddMaterialSelectFormUnitItem}
                    className={styles.AddMaterialFormItem}>
                    <Select
                        options={units}
                        placeholder={'ед.изм.'}
                        className={styles.AddMaterialInput}
                    />
                </Form.Item>
                <Button
                    onClick={addMaterial}
                    className={styles.AddMaterialButton}>
                    Добавить новый материал
                </Button>
            </Space.Compact>
        </Form>
    );
};
