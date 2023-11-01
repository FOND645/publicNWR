import { Button, Form, Input, Space } from 'antd';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC } from 'react';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { addNewBlockQueryBody } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import { appContext } from '@src/render/context';
import styles from './AddBlock.module.css';

type props = {
    deviceID: number;
};

export const AddBlock: FC<props> = ({ deviceID }) => {
    const [addDeviceForm] = Form.useForm();
    if (appContext.auth.roots === 'watcher') return null;

    const addDevice: React.MouseEventHandler<HTMLElement> = () => {
        const name: string | undefined = addDeviceForm.getFieldValue('name');
        const decimal: string | undefined =
            addDeviceForm.getFieldValue('decimal');

        if (!name || !decimal) {
            dispatchMessage({
                content: 'Ввведите название и децимальный номер блока',
                type: 'error',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addNewBlockQueryBody = {
            type: 'add',
            url: 'block',
            params: {
                decimal: decimal.trim().replace(/ {1,}/g, ' '),
                name: name.trim().replace(/ {1,}/g, ' '),
                deviceID: deviceID,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            form={addDeviceForm}
            className={styles.AddBlockForm}>
            <Space.Compact
                direction="horizontal"
                className={styles.AddBlockContainer}>
                <Form.Item
                    name={'name'}
                    className={styles.AddBlockFormItem}>
                    <Input
                        className={styles.AddBlockInput}
                        placeholder="Наименование"
                    />
                </Form.Item>
                <Form.Item
                    name={'decimal'}
                    className={styles.AddBlockFormItem}>
                    <Input
                        placeholder="Дец. номер"
                        className={styles.AddBlockInput}
                    />
                </Form.Item>
                <Button
                    className={styles.AddBlockButton}
                    onClick={addDevice}>
                    Доабвить изделие
                </Button>
            </Space.Compact>
        </Form>
    );
};
