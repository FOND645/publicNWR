import { Button, Form, Space, Input } from 'antd';
import React, { FC } from 'react';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { addContractQueryBody } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import styles from './AddContract.module.css';

type props = {
    organizationID: number;
};

export const AddContract: FC<props> = ({ organizationID }) => {
    const [addOrganizationForm] = Form.useForm();

    const addContract: React.MouseEventHandler<HTMLElement> = () => {
        const number: string | undefined =
            addOrganizationForm.getFieldValue('number');
        const date: string | undefined =
            addOrganizationForm.getFieldValue('date');

        if (!number || !date) {
            dispatchMessage({
                type: 'error',
                content: 'Укажите номер и дату заключения договора',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }

        const queryBody: addContractQueryBody = {
            type: 'add',
            url: 'contract',
            params: {
                date: date.trim(),
                number: number.trim(),
                organizationID: organizationID,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            form={addOrganizationForm}
            className={styles.AddContractForm}>
            <Space.Compact
                direction="horizontal"
                className={styles.AddContractContainer}>
                <Form.Item
                    name={'number'}
                    className={styles.AddContractFormItem}>
                    <Input
                        className={styles.AddContractInput}
                        placeholder="Номер контракта"
                    />
                </Form.Item>
                <Form.Item
                    name={'date'}
                    className={styles.AddContractFormItem}>
                    <Input
                        placeholder="Дата заключения"
                        className={styles.AddContractInput}
                    />
                </Form.Item>
                <Button
                    onClick={addContract}
                    className={styles.AddContractButton}>
                    Добавить контракт
                </Button>
            </Space.Compact>
        </Form>
    );
};
