import { Button, Form, Input, Space } from 'antd';
import React, { FC } from 'react';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { editUserPassword } from '@src/server/EDITqueries';
import { connection } from '@src/render/root';
import styles from './PasswordEditor.module.css';

type props = {
    login: string;
};

export const PasswordEditor: FC<props> = ({ login }) => {
    const [passwordForm] = Form.useForm();

    const changePassword = () => {
        const password: string | undefined =
            passwordForm.getFieldValue('password');
        if (!password) {
            dispatchMessage({
                type: 'error',
                content: 'Введите новый пароль',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: editUserPassword = {
            type: 'edit',
            url: 'userPassword',
            params: {
                login: login,
                password: password,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Space.Compact className={styles.PasswordEditorContainer}>
            <Form
                form={passwordForm}
                className={styles.PasswordEditorForm}>
                <Form.Item
                    name={'password'}
                    className={styles.PasswordEditorFormItem}>
                    <Input.Password
                        placeholder="Новый пароль..."
                        className={styles.PasswordEditorInput}
                    />
                </Form.Item>
            </Form>
            <Button
                onClick={changePassword}
                className={styles.PasswordEditorButton}>
                Изменить
            </Button>
        </Space.Compact>
    );
};
