import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, PopconfirmProps, Space } from 'antd';
import React, { FC } from 'react';
import { deleteDefectQuery } from '@src/server/DELETEqueries';
import { connection } from '@src/render/root';
import { appContext } from '@src/render/context';
import { copyDefect } from '@src/server/ADDqueries';
import styles from './DeleteDefectButton.module.css';

type props = {
    id: number;
};

export const DeleteDefectButton: FC<props> = ({ id }) => {
    const deleteDefect: PopconfirmProps['onConfirm'] = () => {
        const queryBody: deleteDefectQuery = {
            type: 'delete',
            url: 'defect',
            targetID: id,
        };
        connection?.send(JSON.stringify(queryBody));
    };
    if (appContext.auth.roots === 'watcher')
        return (
            <Button disabled={true}>
                <DeleteOutlined disabled={true} />
            </Button>
        );

    const copyDefect: PopconfirmProps['onConfirm'] = () => {
        const queryBody: copyDefect = {
            type: 'add',
            url: 'copyDefect',
            params: {
                defectID: id,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Space.Compact className={styles.DeleteDefectContainer}>
            <Popconfirm
                title={'Удалить неисправность?'}
                okText={'Да'}
                cancelText={'Нет'}
                onConfirm={deleteDefect}>
                <Button className={styles.DeleteDefectButton}>
                    <DeleteOutlined />
                </Button>
            </Popconfirm>
            <Button
                onClick={copyDefect}
                className={styles.CopyDefectButton}>
                <CopyOutlined />
            </Button>
        </Space.Compact>
    );
};
