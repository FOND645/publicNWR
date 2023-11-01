import { Spin, Table } from 'antd';
import { ColumnType } from 'antd/es/table';
import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { defectTableRow } from '@src/server/GETqueries';
import { DeleteDefectButton } from './DeleteDefectButton';
import { DefectExpand } from './DefectExpand';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { WebSocketRequerst } from '@src/server/server';
import { compareText, getResponseHeader } from '@src/globalFunctions';
import { TableSearcher } from '../../Common/TableSearcher';
import styles from './DefectsTable.module.css';

function fetchDefects() {
    return new Promise<defectTableRow[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'defectsForTable',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<defectTableRow[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const DefectsTable: FC = () => {
    const { data, isError, isLoading, error } = useQuery(
        `database_defects`,
        fetchDefects,
        { refetchOnWindowFocus: false }
    );

    const [searchedIDs, setSearchedIDs] = useState<number[] | false>(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    function expanding(expand: boolean, record: defectTableRow) {
        const { id } = record;
        if (expand) {
            setExpandedRows((prevState) => [...prevState, id]);
        } else {
            setExpandedRows((prevState) =>
                prevState.filter((row) => row !== id)
            );
        }
    }

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const defects = data.filter((Defect) => {
        if (searchedIDs === false) return true;
        return searchedIDs.includes(Defect.id);
    });

    interface Ifilter {
        value: string;
        text: string;
    }

    const getFilters = (
        type: 'name' | 'decimal' | 'description'
    ): Ifilter[] => {
        const set = new Set<string>();
        defects.forEach((Defect) => set.add(Defect[type]));
        return Array.from(set).map((Element) => {
            return {
                value: Element,
                text: Element,
            };
        });
    };

    const columns: ColumnType<defectTableRow>[] = [
        {
            title: 'Наименование блока',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: defectTableRow, b: defectTableRow) =>
                compareText(a.name, b.name),
            sortDirections: ['ascend', 'descend'],
            filters: getFilters('name'),
            filterSearch: true,
            onFilter: ((value: string, record: defectTableRow) =>
                record.name.includes(value)) as (
                value: boolean | React.Key,
                record: defectTableRow
            ) => boolean,
        },
        {
            title: 'Децимальный номер',
            dataIndex: 'decimal',
            key: 'decimal',
            sorter: (a: defectTableRow, b: defectTableRow) =>
                compareText(a.decimal, b.decimal),
            sortDirections: ['ascend', 'descend'],
            filters: getFilters('decimal'),
            filterSearch: true,
            onFilter: ((value: string, record: defectTableRow) =>
                record.decimal.includes(value)) as (
                value: boolean | React.Key,
                record: defectTableRow
            ) => boolean,
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            sorter: (a: defectTableRow, b: defectTableRow) =>
                compareText(a.description, b.description),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Действия',
            dataIndex: 'id',
            key: 'actions',
            render: (id: number) => <DeleteDefectButton id={id} />,
        },
    ];

    return (
        <>
            <TableSearcher
                rawData={data}
                setSearchedIDs={
                    setSearchedIDs as (value: number[] | false) => void
                }
            />
            <Table
                dataSource={defects}
                className={styles.DefectsTable}
                columns={columns}
                size={'small'}
                rowKey={(record) => record.id}
                pagination={{
                    position: ['bottomLeft', 'topLeft'],
                    size: 'small',
                }}
                expandable={{
                    expandedRowRender: (record) => (
                        <DefectExpand defectID={record.id} />
                    ),
                    expandedRowKeys: expandedRows,
                    onExpand: expanding,
                }}
            />
        </>
    );
};
