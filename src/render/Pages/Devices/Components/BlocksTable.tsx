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
import { block } from '@src/server/GETqueries';
import { editBlockQueryBody } from '@src/server/EDITqueries';
import { connection } from '@src/render/root';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import { deleteBlockQuery } from '@src/server/DELETEqueries';
import styles from './BlocksTable.module.css';

type props = {
    deviceID: number;
};

function getBlocks(deviceID: number) {
    return new Promise<block[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'deviceBlocks',
            targetID: deviceID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<block[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const BlocksTable: FC<props> = ({ deviceID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_devices_blocks_${deviceID}`,
        () => getBlocks(deviceID),
        { refetchOnWindowFocus: false }
    );

    const [editingID, setEditingID] = useState<number | false>(false);
    const [subDeviceForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const blocks = data;

    const buttonMethods: buttonMethods = {
        setEditing: setEditingID,
        saveChanges: () => {
            const name: string | undefined = subDeviceForm.getFieldValue(
                `${editingID}_name`
            );
            const decimal: string | undefined = subDeviceForm.getFieldValue(
                `${editingID}_decimal`
            );

            if (!name || !decimal) {
                dispatchMessage({
                    type: 'error',
                    content: 'Введите название и децимальный номер блока',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
                return;
            } else {
                const queryBody: editBlockQueryBody = {
                    type: 'edit',
                    url: 'block',
                    targetID: editingID as number,
                    params: {
                        name: name.trim(),
                        decimal: decimal.trim(),
                    },
                };
                connection?.send(JSON.stringify(queryBody));
                setEditingID(false);
            }
        },

        deleteElement(id) {
            const queryBody: deleteBlockQuery = {
                type: 'delete',
                url: 'block',
                targetID: id,
            };
            connection?.send(JSON.stringify(queryBody));
        },
    };

    const columns: ColumnsType<block> = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'name'}
                    type={'text'}
                />
            ),
        },
        {
            title: 'Децимальный номер',
            dataIndex: 'decimal',
            key: 'decimal',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'decimal'}
                    type={'text'}
                />
            ),
        },
        {
            title: 'Действия',
            dataIndex: 'id',
            key: 'actions',
            render: (id) => (
                <EditButtons
                    ID={id}
                    deleteConfirmTitle="Удалить блок? ВНИМАНИЕ! Это приведет к удалению в том числе неисправностей и блоков в ремонте. ВСЕХ ЭТИХ БЛОКОВ!"
                    editingID={editingID}
                    methods={buttonMethods}
                />
            ),
        },
    ];

    return (
        <Form
            form={subDeviceForm}
            className={styles.BlocksTableForm}>
            <Table
                className={styles.BlocksTable}
                dataSource={blocks}
                columns={columns}
                rowKey={(record) => record.id}
                showHeader={false}
                pagination={false}
                size={'small'}
            />
        </Form>
    );
};
