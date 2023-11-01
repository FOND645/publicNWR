import { Checkbox, Space, Spin, Typography } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { setDividedQueryBody } from '@src/server/EDITqueries';
import { connection } from '@src/render/root';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './SetDivided.module.css';

const { Text } = Typography;

type props = {
    repairDeviceID: number;
};

function getDivided(repairDeviceID: number) {
    return new Promise<Boolean>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'isDivided',
            targetID: repairDeviceID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<Boolean>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const SetDivided: FC<props> = ({ repairDeviceID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_isDivided_${repairDeviceID}`,
        () => getDivided(repairDeviceID),
        { refetchOnWindowFocus: false }
    );
    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }

    const setDivider = (event: CheckboxChangeEvent) => {
        const { checked } = event.target;
        const queryBody: setDividedQueryBody = {
            type: 'edit',
            url: 'divided',
            targetID: repairDeviceID,
            params: {
                divided: checked,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Space
            direction="horizontal"
            className={styles.SetDividedContainer}>
            <Checkbox
                className={styles.SetDividedCheckbox}
                checked={Boolean(data)}
                onChange={setDivider}
            />
            <Text className={styles.SetDividedText}>
                Делить перечень на строки?
            </Text>
        </Space>
    );
};
