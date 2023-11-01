import { Form, Spin, Table } from 'antd';
import React, { FC, useState } from 'react';
import { defectAction } from '@src/server/GETqueries';
import { useQuery } from 'react-query';
import { ColumnsType } from 'antd/es/table';
import { ActionExpand } from './ActionExpand';
import { ActionField } from './ActionField';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import {
    EditButtons,
    buttonMethods,
} from '@src/render/Pages/Common/EditButtons';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { editActionQueryBody } from '@src/server/EDITqueries';
import { deleteActionQuery } from '@src/server/DELETEqueries';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './ActionsTable.module.css';

type props = {
    defectID: number;
};

function getDefectActions(defectID: number) {
    return new Promise<defectAction[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'actionsFormDefect',
            targetID: defectID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<defectAction[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const ActionsTable: FC<props> = ({ defectID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_ations_defects${defectID}`,
        () => getDefectActions(defectID),
        { refetchOnWindowFocus: false }
    );
    const [editingID, setEditingID] = useState<number | false>(false);
    const [actionsTableForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const defectActions = data;

    const buttonsMethods: buttonMethods = {
        setEditing: setEditingID,
        saveChanges: () => {
            const index: string | undefined = actionsTableForm.getFieldValue(
                `${editingID}_index`
            );
            const action: string | undefined = actionsTableForm.getFieldValue(
                `${editingID}_action`
            );
            if (!index || !action) {
                dispatchMessage({
                    content: 'Введите индекс и действие',
                    duration: VALIDATION_MESSAGE_DURATION,
                    type: 'error',
                });
                return;
            }
            const queryBody: editActionQueryBody = {
                type: 'edit',
                url: 'action',
                targetID: editingID as number,
                params: {
                    index: index.trim(),
                    action: action.trim(),
                },
            };
            connection?.send(JSON.stringify(queryBody));
            setEditingID(false);
        },
        deleteElement(id) {
            const queryBody: deleteActionQuery = {
                type: 'delete',
                url: 'action',
                targetID: id,
            };
            connection?.send(JSON.stringify(queryBody));
        },
    };

    const columns: ColumnsType<defectAction> = [
        {
            title: 'Индекс',
            dataIndex: 'index',
            key: 'index',
            render: (_, record) => (
                <ActionField
                    data={record}
                    field={'index'}
                    editingID={editingID}
                />
            ),
        },
        {
            title: 'Действие',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <ActionField
                    data={record}
                    field={'action'}
                    editingID={editingID}
                />
            ),
        },
        {
            title: 'Ред.',
            dataIndex: 'id',
            key: 'edit',
            render: (actionID) => (
                <EditButtons
                    ID={actionID}
                    editingID={editingID}
                    deleteConfirmTitle="Удалить действие?"
                    methods={buttonsMethods}
                />
            ),
        },
    ];

    return (
        <Form
            form={actionsTableForm}
            className={styles.ActionsTableForm}>
            <Table
                columns={columns}
                dataSource={defectActions}
                rowKey={(record) => record.id}
                className={styles.ActionsTable}
                size="small"
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <ActionExpand actionID={record.id} />
                    ),
                }}
            />
        </Form>
    );
};
