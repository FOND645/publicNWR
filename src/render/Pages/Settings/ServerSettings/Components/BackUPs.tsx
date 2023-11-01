import {
    DeleteOutlined,
    EnterOutlined,
    RollbackOutlined,
} from '@ant-design/icons';
import { getResponseHeader } from '@src/globalFunctions';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { createBackUP } from '@src/server/EDITqueries';
import { WebSocketRequerst } from '@src/server/server';
import { Button, Space, Spin, Typography } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import styles from './BackUPs.module.css';

const { Text } = Typography;

type props = {};

function getBackUPs() {
    return new Promise<{ name: string }[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'backUPS',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<{ name: string }[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const BackUPs: FC<props> = ({}) => {
    const { data, isError, isLoading, error } = useQuery(
        `databse_backups`,
        getBackUPs,
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

    const createBackUp = () => {
        const queryBody: createBackUP = {
            type: 'edit',
            url: 'createDBBackUP',
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Space
            size={'small'}
            direction="vertical"
            className="">
            <Button
                className={styles.BackUPsCreateBackupButton}
                onClick={createBackUp}>
                <EnterOutlined />
                Создать бэкап
            </Button>
            {data.map((File) => (
                <Space
                    size={'small'}
                    direction="horizontal">
                    <Button className={styles.BackUPsSetButton}>
                        <RollbackOutlined />
                    </Button>
                    <Button>
                        <DeleteOutlined />
                    </Button>
                    <Text className={styles.BackUPsName}>{File.name}</Text>
                </Space>
            ))}
        </Space>
    );
};
