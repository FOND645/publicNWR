import { Divider, Space, Spin, Typography } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { defectDetails } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './DefectContent.module.css';

const { Text } = Typography;

type props = {
    defectID: number;
};

function getDefectDetails(defectID: number) {
    return new Promise<defectDetails>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'defectDetailsForRepair',
            targetID: defectID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<defectDetails>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const DefectContent: FC<props> = ({ defectID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_defect_details_${defectID}`,
        () => getDefectDetails(defectID),
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

    const [defectMain, actions, materials] = data as defectDetails;
    const { defect, solution } = defectMain[0];

    return (
        <Space
            direction="vertical"
            className={styles.DefectContentContainer}>
            <Space.Compact
                direction="vertical"
                className={styles.DefectContentDescriptionContainer}>
                <Text
                    strong
                    className={styles.DefectContentDescriptionTitle}>
                    Описание дефекта
                </Text>
                <Text className={styles.DefectContentDescription}>
                    {defect}
                </Text>
            </Space.Compact>
            <Divider className={styles.DefectContentDivider} />

            <Space.Compact
                direction="vertical"
                className={styles.DefectContentSolutionContainer}>
                <Text
                    strong
                    className={styles.DefectContentSolutionTitle}>
                    Решение
                </Text>
                <Text className={styles.DefectContentSolution}>{solution}</Text>
            </Space.Compact>
            <Divider className={styles.DefectContentDivider} />

            <Space.Compact
                direction="vertical"
                className={styles.DefectContentActionsContainer}>
                <Text
                    strong
                    className={styles.DefectContentActionsTitle}>
                    Действия
                </Text>
                {actions.map((Action) => {
                    const { action, index } = Action;
                    const actionID = Action.id;
                    return (
                        <Space.Compact
                            direction="vertical"
                            className={styles.DefectContentActionContainer}>
                            <Space.Compact
                                direction="horizontal"
                                className={
                                    styles.DefectContentActionTextContainer
                                }>
                                <Text
                                    className={
                                        styles.DefectContentActionIndex
                                    }>{`Индекс: ${index}.`}</Text>
                                <Divider type={'vertical'} />
                                <Text
                                    className={
                                        styles.DefectContentActionText
                                    }>{`Действие: ${action}`}</Text>
                            </Space.Compact>
                            {materials
                                .filter(
                                    (Material) => Material.actionID === actionID
                                )
                                .map((Material) => (
                                    <Text
                                        type={'secondary'}
                                        className={
                                            styles.DefectContentMaterial
                                        }>
                                        {`- ${Material.name} - ${Material.count} ${Material.unit}`}
                                    </Text>
                                ))}
                            <Divider className={styles.DefectContentDivider} />
                        </Space.Compact>
                    );
                })}
            </Space.Compact>
        </Space>
    );
};
