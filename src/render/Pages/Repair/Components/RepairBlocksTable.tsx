import { Form, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import {
    EditButtons,
    buttonMethods,
} from '@src/render/Pages/Common/EditButtons';
import { EditField } from '@src/render/Pages/Common/EditField';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { repairBlockForTable } from '@src/server/GETqueries';
import { RepairBlockExpand } from './RepairBlockExpand';
import { editRepairBlock } from '@src/server/EDITqueries';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { deleteRepairBlockQuery } from '@src/server/DELETEqueries';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './RepairBlocksTable.module.css';

type props = {
    repairDeviceID: number;
};

function getRepairBlocks(repairDeviceID: number) {
    return new Promise<repairBlockForTable[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'repairBlocksInRepairDevice',
            targetID: repairDeviceID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<repairBlockForTable[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const RepairBlocksTable: FC<props> = ({ repairDeviceID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_repair_blocks_${repairDeviceID}`,
        () => getRepairBlocks(repairDeviceID),
        { refetchOnWindowFocus: false }
    );

    const [editingID, setEditingID] = useState<number | false>(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [BlocksTableForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    function expanding(expand: boolean, record: repairBlockForTable) {
        const { id } = record;
        if (expand) {
            setExpandedRows((prevState) => [...prevState, id]);
        } else {
            setExpandedRows((prevState) =>
                prevState.filter((row) => row !== id)
            );
        }
    }

    const buttonMethods: buttonMethods = {
        setEditing: setEditingID,
        deleteElement: (id) => {
            const queryBody: deleteRepairBlockQuery = {
                type: 'delete',
                url: 'repairBlock',
                targetID: id,
            };
            connection?.send(JSON.stringify(queryBody));
        },
        saveChanges: () => {
            const count: number | undefined = BlocksTableForm.getFieldValue(
                `${editingID}_count`
            );
            const serialNumber: string =
                count === 0
                    ? '-'
                    : BlocksTableForm.getFieldValue(
                          `${editingID}_serialNumber`
                      ) || 'б/н';

            if (count === undefined || serialNumber === undefined) {
                dispatchMessage({
                    type: 'error',
                    content: 'Укажите количество и серийный номер',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
                return;
            }
            const queryBody: editRepairBlock = {
                type: 'edit',
                url: 'repairBlock',
                targetID: editingID as number,
                params: {
                    count: count,
                    serialNumber: serialNumber,
                },
            };
            connection?.send(JSON.stringify(queryBody));
            setEditingID(false);
        },
    };

    const repairSubTableColumns: ColumnsType<repairBlockForTable> = [
        {
            title: 'Изделие',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Дец. №',
            dataIndex: 'decimal',
            key: 'decimal',
        },
        {
            title: 'Кол-во',
            dataIndex: 'count',
            key: 'count',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'count'}
                    type={'numder'}
                />
            ),
        },
        {
            title: 'Зав. №',
            dataIndex: 'serialNumber',
            key: 'serialNumber',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'serialNumber'}
                    type={'text'}
                />
            ),
        },
        {
            title: 'Действия',
            dataIndex: 'id',
            key: 'action',
            render: (id) => (
                <EditButtons
                    ID={id}
                    deleteConfirmTitle={'Удалить блок из ремонта?'}
                    editingID={editingID}
                    methods={buttonMethods}
                />
            ),
        },
    ];

    return (
        <Form
            form={BlocksTableForm}
            className={styles.RepairBlocksTableForm}>
            <Table
                dataSource={data}
                className={styles.RepairBlocksTTable}
                columns={repairSubTableColumns}
                rowKey={(record) => record.id}
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <RepairBlockExpand repairBlockID={record.id} />
                    ),
                    expandedRowKeys: expandedRows,
                    onExpand: expanding,
                }}
            />
        </Form>
    );
};
