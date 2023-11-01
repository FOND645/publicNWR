import { Button, Form, Input, Space } from 'antd';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC } from 'react';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { addNewDeviceQueryBody } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import { appContext } from '@src/render/context';
import styles from './AddDevice.module.css';

export const AddDevice: FC = () => {
    const [addDeviceForm] = Form.useForm();
    if (appContext.auth.roots === 'watcher') return null;

    const addDevice: React.MouseEventHandler<HTMLElement> = () => {
        const name: string | undefined = addDeviceForm.getFieldValue(`name`);
        const decimal: string | undefined =
            addDeviceForm.getFieldValue(`decimal`);

        if (!name || !decimal) {
            dispatchMessage({
                type: 'error',
                content: 'Введите наименование и децимальный номер',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        } else {
            const queryBody: addNewDeviceQueryBody = {
                type: 'add',
                url: 'device',
                params: {
                    name: name.trim(),
                    decimal: decimal.trim(),
                },
            };
            connection?.send(JSON.stringify(queryBody));
            return;
        }
    };

    return (
        <Form
            form={addDeviceForm}
            className={styles.AddDeviceFrom}>
            <Space.Compact
                direction="horizontal"
                className={styles.AddDeviceContainer}>
                <Form.Item
                    name={'name'}
                    className={styles.AddDeviceFormItem}>
                    <Input
                        placeholder="Наименование"
                        className={styles.AddDeviceInput}
                    />
                </Form.Item>
                <Form.Item
                    name={'decimal'}
                    className={styles.AddDeviceFormItem}>
                    <Input
                        placeholder="Дец. номер"
                        className={styles.AddDeviceInput}
                    />
                </Form.Item>
                <Button
                    className={styles.AddDeviceButton}
                    onClick={addDevice}>
                    Доабвить изделие
                </Button>
            </Space.Compact>
        </Form>
    );
};
