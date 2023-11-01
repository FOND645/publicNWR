import { roots } from '@src/server/authorization';
import { Button, Form, Select, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React, { FC } from 'react';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { editUserRoots } from '@src/server/EDITqueries';
import { connection } from '@src/render/root';
import styles from './RootsEditor.module.css';

type props = {
    login: string;
    currentRoots: roots;
};

export const RootsEditor: FC<props> = ({ currentRoots, login }) => {
    const [rootsForm] = Form.useForm();

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

    const changeRoots = () => {
        const roots: roots | undefined = rootsForm.getFieldValue('roots');
        if (!roots) {
            dispatchMessage({
                type: 'error',
                content: 'Укажите новые права',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        if (roots === currentRoots) return;
        const queryBody: editUserRoots = {
            type: 'edit',
            url: 'userRoots',
            params: {
                login: login,
                roots: roots,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Space.Compact className={styles.RootsEditorContainer}>
            <Form
                form={rootsForm}
                className={styles.RootsEditorForm}>
                <Form.Item
                    className={styles.RootsEditorFormItem}
                    name={'roots'}
                    initialValue={currentRoots}>
                    <Select
                        options={rootsOptioms}
                        className={styles.RootsEditorSelect}
                    />
                </Form.Item>
            </Form>
            <Button
                onClick={changeRoots}
                className={styles.RootsEditorButton}>
                Установить
            </Button>
        </Space.Compact>
    );
};
