import { Space, Spin, Typography } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { contractHead } from '@src/server/GETqueries';
import { connection } from '@src/render/root';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './ContractHead.module.css';

const { Title } = Typography;

type props = {
    contractID: number;
};

function getContractHead(contractID: number) {
    return new Promise<contractHead>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'contractHead',
            targetID: contractID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<contractHead>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const ContractHead: FC<props> = ({ contractID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_contract_head_${contractID}`,
        () => getContractHead(contractID),
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

    if (contractID === 0)
        return (
            <Space.Compact
                direction="vertical"
                className={styles.ContractHeadContainer}>
                <Title
                    level={1}
                    className={styles.ContractHeadTitle}>
                    Документы по сопровождению изделий по единичным договорам
                </Title>
            </Space.Compact>
        );

    const { number, date, organization_name } = data as contractHead;

    console.log(data);

    return (
        <Space.Compact
            direction="vertical"
            className={styles.ContractHeadContainer}>
            <Title
                level={1}
                className={styles.ContractHeadTitle}>
                Документы по сопровождению изделий
            </Title>
            <Title
                level={3}
                className={styles.ContractHeadNumber}>
                по договору № {number}
            </Title>
            <Title
                level={3}
                className={styles.ContractHeadDate}>
                с организацией {organization_name} от {date}
            </Title>
        </Space.Compact>
    );
};
