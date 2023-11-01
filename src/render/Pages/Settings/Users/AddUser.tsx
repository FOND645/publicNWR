import { roots } from '@src/server/authorization';
import { Button, Form, Input, Select, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React, { FC } from 'react';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { addUserQueryBody } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import styles from './AddUser.module.css';

type props = {};

export const AddUser: FC<props> = ({}) => {
    const [addUserForm] = Form.useForm();

    const rootsOptioms: DefaultOptionType[] = [
        {
            label: 'admin',
            value: 'admin',
        },
        {
            label: 'editor',
            value: 'editor',
        },
        {
            label: 'watcher',
            value: 'watcher',
        },
    ];

    const addUser = () => {
        const login: string | undefined = addUserForm.getFieldValue('login');
        const password: string | undefined =
            addUserForm.getFieldValue('password');
        const roots: roots | undefined = addUserForm.getFieldValue('roots');

        if (!login || !password || !roots) {
            dispatchMessage({
                type: 'error',
                content: 'Введите логин, пароль и укажите права',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }

        const queryBody: addUserQueryBody = {
            type: 'add',
            url: 'user',
            params: {
                login: login,
                password: password,
                roots: roots,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            className={styles.AddUserForm}
            form={addUserForm}>
            <Space.Compact className={styles.AddUserContainer}>
                <Form.Item
                    name={'login'}
                    className={styles.AddUserFormItem}>
                    <Input
                        className={styles.AddUserInput}
                        placeholder="Логин..."
                    />
                </Form.Item>
                <Form.Item
                    name={'password'}
                    className={styles.AddUserFormItem}>
                    <Input.Password
                        placeholder="Пароль"
                        className={styles.AddUserInput}
                    />
                </Form.Item>
                <Form.Item
                    name={'roots'}
                    initialValue={'watcher'}
                    className={styles.AddUserRootsFormItem}>
                    <Select
                        options={rootsOptioms}
                        className={styles.AddUserInput}
                    />
                </Form.Item>
                <Button
                    onClick={addUser}
                    className={styles.AddUserButton}>
                    Добавить пользователя
                </Button>
            </Space.Compact>
        </Form>
    );
};
