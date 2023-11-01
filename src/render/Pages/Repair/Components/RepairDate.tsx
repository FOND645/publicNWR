import { Space, Spin, Typography } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { repairTimes } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './RepairDate.module.css';

const { Text } = Typography;

type props = {
    repairDeviceID: number;
};

function getTimes(repairDeviceID: number) {
    return new Promise<[repairTimes]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'repairDeviceTimes',
            targetID: repairDeviceID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<[repairTimes]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const RepairDate: FC<props> = ({ repairDeviceID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_times_${repairDeviceID}`,
        () => getTimes(repairDeviceID),
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

    const { changeTime, createTime } = (data as [repairTimes])[0];

    function formatDate(inputDate: number): string {
        const date: Date = new Date(inputDate);
        const months = [
            'янв.',
            'фев.',
            'март',
            'апр.',
            'май',
            'июнь',
            'июль',
            'авг.',
            'сен.',
            'окт.',
            'ноя.',
            'дек.',
        ];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
    }

    return (
        <Space.Compact
            direction="vertical"
            className={styles.RepairDateContainer}>
            <Space.Compact
                direction="horizontal"
                className={styles.RepairDateCreateContainer}>
                <Text
                    strong
                    className={styles.RepairDateCreateTitle}>
                    Внесено в базу:{' '}
                </Text>
                <Text className={styles.RepairDateCreateTime}>
                    {formatDate(createTime)}
                </Text>
            </Space.Compact>
            <Space.Compact
                direction="horizontal"
                className={styles.RepairDateChangeContainer}>
                <Text
                    strong
                    className={styles.RepairDateChangeTitle}>
                    Последнее изменение:{' '}
                </Text>
                <Text className={styles.RepairDateChangeTime}>
                    {formatDate(changeTime)}
                </Text>
            </Space.Compact>
        </Space.Compact>
    );
};
