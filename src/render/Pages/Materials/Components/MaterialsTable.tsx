import { Form, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { material } from '@src/server/GETqueries';
import { MaterialField } from './MaterialField';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import {
    EditButtons,
    buttonMethods,
} from '@src/render/Pages/Common/EditButtons';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { editMaterialQueryBody } from '@src/server/EDITqueries';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { deleteMaterialQuery } from '@src/server/DELETEqueries';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './MaterialsTable.module.css';

export function getMaterials() {
    return new Promise<material[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'materials',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<material[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const MaterialsTable: FC = () => {
    const { data, isError, isLoading, error } = useQuery(
        `database_materials`,
        getMaterials,
        { refetchOnWindowFocus: false }
    );

    const [editingID, setEditingID] = useState<number | false>(false);
    const [materialsForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const materials = data as material[];

    const buttonMethods: buttonMethods = {
        setEditing: setEditingID,

        saveChanges: () => {
            const name: string | undefined = materialsForm.getFieldValue(
                `${editingID}_name`
            );
            const unit: string | undefined = materialsForm.getFieldValue(
                `${editingID}_unit`
            );
            if (!name || !unit) {
                dispatchMessage({
                    type: 'error',
                    content: 'Введите название и единицы измерения',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
                return;
            } else {
                const queryBody: editMaterialQueryBody = {
                    type: 'edit',
                    url: 'material',
                    targetID: editingID as number,
                    params: {
                        name: name.trim(),
                        unit: unit.trim(),
                    },
                };
                connection?.send(JSON.stringify(queryBody));
                setEditingID(false);
                return;
            }
        },

        deleteElement: (materialID) => {
            const queryBody: deleteMaterialQuery = {
                type: 'delete',
                url: 'material',
                targetID: materialID,
            };
            connection?.send(JSON.stringify(queryBody));
        },
    };

    const columns: ColumnsType<material> = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <MaterialField
                    data={record}
                    field={'name'}
                    editingID={editingID}
                    key={record.id}
                />
            ),
        },
        {
            title: 'Единицы измерения',
            dataIndex: 'unit',
            key: 'unit',
            render: (_, record) => (
                <MaterialField
                    data={record}
                    field={'unit'}
                    editingID={editingID}
                    key={record.id}
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
                    editingID={editingID}
                    methods={buttonMethods}
                    deleteConfirmTitle="Удалить материал?"
                />
            ),
        },
    ];

    return (
        <Form
            form={materialsForm}
            className={styles.MaterialsTableForm}>
            <Table
                className={styles.MaterialsTable}
                columns={columns}
                dataSource={materials}
                pagination={{
                    position: ['bottomLeft', 'topLeft'],
                    size: 'small',
                }}
                size={'small'}
                rowKey={(record) => record.id}
            />
        </Form>
    );
};
