import { Form, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { device } from '@src/server/GETqueries';
import { DeviceExpand } from './DeviceExpand';
import {
    EditButtons,
    buttonMethods,
} from '@src/render/Pages/Common/EditButtons';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { EditField } from '@src/render/Pages/Common/EditField';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { editDeviceQueryBody } from '@src/server/EDITqueries';
import { deleteDeviceQuery } from '@src/server/DELETEqueries';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './DevicesTable.module.css';

export function getDevices() {
    return new Promise<device[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'devices',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<device[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const DevicesTable: FC = () => {
    const { data, isError, isLoading, error } = useQuery(
        `database_devices`,
        getDevices,
        { refetchOnWindowFocus: false }
    );

    const [editingID, setEditingID] = useState<number | false>(false);

    const [devicesForm] = Form.useForm();

    // Катсомное слежение за открытыми expand`ами
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const expandHandler: (expanded: boolean, record: device) => void = (
        expanded,
        record
    ) => {
        if (expanded) {
            setExpandedRows((prevState) => [...prevState, record.id]);
        } else {
            setExpandedRows((prevState) =>
                prevState.filter((ID) => ID !== record.id)
            );
        }
    };

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const devices = data;

    const buttonsMethods: buttonMethods = {
        setEditing: setEditingID,

        saveChanges: () => {
            const name: string | undefined = devicesForm.getFieldValue(
                `${editingID}_name`
            );
            const decimal: string | undefined = devicesForm.getFieldValue(
                `${editingID}_decimal`
            );
            if (!name || !decimal) {
                dispatchMessage({
                    type: 'error',
                    content: 'Введите название и единицы измерения',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
                return;
            }
            const queryBody: editDeviceQueryBody = {
                type: 'edit',
                url: 'device',
                targetID: editingID as number,
                params: {
                    name: name.trim(),
                    decimal: decimal.trim(),
                },
            };
            connection?.send(JSON.stringify(queryBody));
            setEditingID(false);
            return;
        },

        deleteElement(id) {
            const queryBody: deleteDeviceQuery = {
                type: 'delete',
                url: 'device',
                targetID: id,
            };
            connection?.send(JSON.stringify(queryBody));
        },
    };

    const columns: ColumnsType<device> = [
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
            key: '',
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
            title: 'Ред.',
            dataIndex: 'id',
            key: 'edit',
            render: (id) => (
                <EditButtons
                    ID={id}
                    deleteConfirmTitle="Удалить устройство?"
                    editingID={editingID}
                    methods={buttonsMethods}
                    key={id}
                />
            ),
        },
    ];

    return (
        <Form
            form={devicesForm}
            className={styles.DevicesTableForm}>
            <Table
                className={styles.DevicesTable}
                dataSource={devices}
                columns={columns}
                pagination={false}
                rowKey={(record) => record.id}
                size={'small'}
                expandable={{
                    expandedRowRender: (record) => (
                        <DeviceExpand deviceID={record.id} />
                    ),
                    expandedRowKeys: expandedRows,
                    onExpand: expandHandler,
                }}
            />
        </Form>
    );
};
