import { DeleteOutlined } from '@ant-design/icons';
import { connection } from '@src/render/root';
import { deleteUserQuery } from '@src/server/DELETEqueries';
import { Button } from 'antd';
import React, { FC } from 'react';
import styles from './DeleteUser.module.css';

type props = {
    login: string;
};

export const DeleteUser: FC<props> = ({ login }) => {
    const deleteUser = () => {
        const queryBody: deleteUserQuery = {
            type: 'delete',
            url: 'user',
            targetID: login,
        };
        connection?.send(JSON.stringify(queryBody));
    };
    return (
        <Button
            onClick={deleteUser}
            className={styles.DeleteUserButton}>
            <DeleteOutlined />
        </Button>
    );
};
