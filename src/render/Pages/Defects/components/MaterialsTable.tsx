import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { Form, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { actionMaterial } from '@src/server/GETqueries';
import { MaterialField } from './MaterialsField';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import {
    EditButtons,
    buttonMethods,
} from '@src/render/Pages/Common/EditButtons';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dataListner } from '@src/render/ResponseHandler';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { editActionMaterialQueryBody } from '@src/server/EDITqueries';
import { deleteActionMaterialQuery } from '@src/server/DELETEqueries';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './MaterialsTable.module.css';

type props = {
    actionID: number;
};

function getActionMaterials(actionID: number) {
    return new Promise<actionMaterial[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'actionMaterials',
            targetID: actionID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<actionMaterial[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const MaterialsTable: FC<props> = ({ actionID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_actions_materials_${actionID}`,
        () => getActionMaterials(actionID),
        { refetchOnWindowFocus: false }
    );

    const [editingID, setEditingID] = useState<false | number>(false);
    const [acionMaterialsForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const materials = data;

    const buttonsMethods: buttonMethods = {
        setEditing: setEditingID,

        saveChanges: () => {
            const count: number = acionMaterialsForm.getFieldValue(
                `${editingID}_count`
            );
            if (count <= 0) {
                dispatchMessage({
                    type: 'error',
                    content: 'Количество должно быть больше нуля',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
            } else {
                const queryBody: editActionMaterialQueryBody = {
                    type: 'edit',
                    url: 'actionMaterial',
                    params: {
                        materialID: editingID as number,
                        actionID: actionID,
                        count: count,
                    },
                };
                connection?.send(JSON.stringify(queryBody));
                setEditingID(false);
            }
        },

        deleteElement: (materialID) => {
            const queryBody: deleteActionMaterialQuery = {
                type: 'delete',
                url: 'actionMaterial',
                params: {
                    actionID: actionID,
                    materialID: materialID,
                },
            };
            connection?.send(JSON.stringify(queryBody));
        },
    };

    const columns: ColumnsType<actionMaterial> = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Кол-во',
            dataIndex: 'count',
            key: 'count',
            render: (_, record) => (
                <MaterialField
                    data={record}
                    field={'count'}
                    editingID={editingID}
                />
            ),
        },
        {
            title: 'Ед.изм',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'Действия',
            dataIndex: 'material_id',
            key: 'edit',
            render: (materialID) => (
                <EditButtons
                    ID={materialID}
                    deleteConfirmTitle="Удалить материал?"
                    editingID={editingID}
                    methods={buttonsMethods}
                />
            ),
        },
    ];

    return (
        <Form
            form={acionMaterialsForm}
            className={styles.MaterialsTableForm}>
            <Table
                columns={columns}
                className={styles.MaterialsTable}
                dataSource={materials}
                pagination={false}
                size={'small'}
                rowKey={(record) => record.material_id}
            />
        </Form>
    );
};
