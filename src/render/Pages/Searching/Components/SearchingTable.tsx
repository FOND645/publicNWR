import { searchedRepair, searchingRepair } from '@src/server/GETqueries';
import Table, { ColumnsType } from 'antd/es/table';
import React, { FC } from 'react';
import styles from './SearchingTable.module.css';
import { Typography } from 'antd';
import { getResponseHeader } from '@src/globalFunctions';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { useQuery } from 'react-query';
import { LoadingError } from '../../Common/LoadingError';

const { Text } = Typography;

type props = {
    searchingQuery: string | undefined;
};

function searching(searchingQuery: string | undefined) {
    return new Promise<searchedRepair[]>((resolve, reject) => {
        console.log(searchingQuery);
        if (!searchingQuery) {
            resolve([]);
        }
        const request: searchingRepair = {
            type: 'get',
            url: 'searchingRepair',
            targetID: searchingQuery as string,
        };
        const awaitedEventName = getResponseHeader(request);
        console.log(awaitedEventName);
        const resolver = dataListner<searchedRepair[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const SearchingTable: FC<props> = ({ searchingQuery }) => {
    const { data, isError, error } = useQuery(
        `get_searchingRepair${searchingQuery}_response`,
        () => searching(searchingQuery)
    );

    if (isError) {
        return <LoadingError error={error} />;
    }
    const columns: ColumnsType<searchedRepair> = [
        {
            title: 'Договор',
            dataIndex: 'organizationName',
            render: (_, record) =>
                `${record.organizationName}\n...${record.contractNumber.slice(
                    -8
                )}`,
        },
        {
            title: 'Устройство',
            dataIndex: 'deviceName',
            render: (_, record) =>
                `${record.repairNumber}. ${record.deviceName}\n${record.deviceDecimal}`,
        },
        {
            title: 'Зав. № устройства',
            dataIndex: 'deviceSerialNumber',
            render: (text) =>
                searchingQuery === text ? (
                    <Text mark>{text}</Text>
                ) : (
                    <Text>{text}</Text>
                ),
        },
        {
            title: 'Блок',
            dataIndex: 'blockName',
            render: (_, record) =>
                `${record.blockName}\n${record.blockDecimal}`,
        },
        {
            title: 'Зав. № блока',
            dataIndex: 'blockSerialNumber',
            render: (text) =>
                searchingQuery === text ? (
                    <Text mark>{text}</Text>
                ) : (
                    <Text>{text}</Text>
                ),
        },
    ];
    return (
        <Table
            dataSource={data}
            size="small"
            columns={columns}
            className={styles.SearchingTitle}
        />
    );
};
