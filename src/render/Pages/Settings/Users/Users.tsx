import { getResponseHeader } from '@src/globalFunctions';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { user } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import { Divider, Space, Spin, Typography } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '../../Common/LoadingError';
import Table, { ColumnsType } from 'antd/es/table';
import { PasswordEditor } from './PasswordEditor';
import { RootsEditor } from './RootsEditor';
import { DeleteUser } from './DeleteUser';
import { AddUser } from './AddUser';
import styles from './Users.module.css';

const { Title } = Typography;

type props = {};

function getUsers() {
    return new Promise<user[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'users',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<user[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const Users: FC<props> = ({}) => {
    const { data, isError, error, isLoading } = useQuery(
        `server_users`,
        () => getUsers(),
        { refetchOnWindowFocus: false }
    );

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    console.log(data);

    const usersColumns: ColumnsType<user> = [
        {
            title: 'Логин',
            dataIndex: 'login',
        },
        {
            title: 'Пароль',
            dataIndex: 'login',
            render: (login) => <PasswordEditor login={login} />,
        },
        {
            title: 'Права',
            dataIndex: 'roots',
            render: (_, record) => (
                <RootsEditor
                    login={record.login}
                    currentRoots={record.roots}
                />
            ),
        },
        {
            title: 'Удалить',
            dataIndex: 'login',
            render: (login) => <DeleteUser login={login} />,
        },
    ];

    return (
        <Space.Compact
            direction="vertical"
            className={styles.UsersContainer}>
            <Title className={styles.UsersTitle}>Редактор пользователей</Title>
            <Divider />
            <Table
                className={styles.UsersTable}
                dataSource={data}
                columns={usersColumns}
                size="small"
                pagination={false}
            />
            <AddUser />
        </Space.Compact>
    );
};
