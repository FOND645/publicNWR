import { Space, Spin, Typography } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { repairNote } from '@src/server/GETqueries';
import { RepairNote } from './RepairNote';
import { FormOutlined } from '@ant-design/icons';
import { AddRepairNote } from './AddRepairNote';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './RepairNotes.module.css';

const { Title } = Typography;

type props = {
    repairDeviceID: number;
};

function getNotes(repairDeviceID: number) {
    return new Promise<repairNote[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'repairDeviceNotes',
            targetID: repairDeviceID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<repairNote[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const RepairNotes: FC<props> = ({ repairDeviceID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_notes_${repairDeviceID}`,
        () => getNotes(repairDeviceID),
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
            direction={'vertical'}
            align="center"
            className={styles.ReapirNotesContainer}>
            <Title
                level={3}
                className={styles.RepairNotesTitle}>
                Примечания
            </Title>
            <Space
                direction={'vertical'}
                className={styles.RepairNotesMapContainer}>
                {data.length ? (
                    data.map((Note) => (
                        <RepairNote
                            id={Note.id}
                            date={Note.date}
                            text={Note.text}
                            key={Note.id}
                        />
                    ))
                ) : (
                    <Space
                        className={styles.RepairNotesNoNotesContainer}
                        direction={'vertical'}
                        align="center">
                        <FormOutlined
                            className={styles.RepairNotesNoContainerIcon}
                        />
                        <Title
                            level={4}
                            className={styles.RepairNotesNoContainerTitle}>
                            Нет примечаний
                        </Title>
                    </Space>
                )}
            </Space>
            <AddRepairNote repairDeviceID={repairDeviceID} />
        </Space>
    );
};
