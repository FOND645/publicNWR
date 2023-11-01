import { Divider, Space, Spin } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { blockDefect } from '@src/server/GETqueries';
import { DefectItem } from './DefectItem';
import { AddDefect } from './AddDefect';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './RepairBlockExpand.module.css';

type props = {
    repairBlockID: number;
};

function getBlockDefects(repairBlockID: number) {
    return new Promise<blockDefect[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'repairBlockDefects',
            targetID: repairBlockID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<blockDefect[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const RepairBlockExpand: FC<props> = ({ repairBlockID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_repair_blocks_defects_${repairBlockID}`,
        () => getBlockDefects(repairBlockID),
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

    return (
        <Space
            size={'small'}
            direction={'vertical'}
            className={styles.RepairBlockExpandContainer}>
            {data ? (
                data.map((Defect) => (
                    <DefectItem
                        defectID={Defect.id}
                        description={Defect.description}
                        repairBlockID={repairBlockID}
                    />
                ))
            ) : (
                <div />
            )}
            <Divider className={styles.RepairBlockExpandDivider} />
            <AddDefect repairBlockID={repairBlockID} />
        </Space>
    );
};
