import { getResponseHeader } from '@src/globalFunctions';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { contract } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '../../Common/LoadingError';
import { Form, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { EditField } from '../../Common/EditField';
import { EditButtons, buttonMethods } from '../../Common/EditButtons';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { editContractQueryBody } from '@src/server/EDITqueries';
import { deleteContractQuery } from '@src/server/DELETEqueries';
import styles from './ContractsTable.module.css';

type props = {
    organizationID: number;
};

function getContracts(organizationID: number) {
    return new Promise<contract[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'contracts',
            targetID: organizationID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<contract[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const ContractsTable: FC<props> = ({ organizationID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_contract_${organizationID}`,
        () => getContracts(organizationID),
        { refetchOnWindowFocus: false }
    );

    const [contractsTableForm] = Form.useForm();

    const [editingID, setEditingID] = useState<number | false>(false);

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const buttonsMethods: buttonMethods = {
        setEditing: setEditingID,
        saveChanges: () => {
            const number: string | undefined = contractsTableForm.getFieldValue(
                `${editingID}_number`
            );
            const date: string | undefined = contractsTableForm.getFieldValue(
                `${editingID}_date`
            );
            if (!number || !date) {
                dispatchMessage({
                    type: 'error',
                    content: 'Введите номер и дату заключения договора',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
                return;
            }
            const queryBody: editContractQueryBody = {
                type: 'edit',
                url: 'contract',
                targetID: editingID as number,
                params: {
                    date: date.trim(),
                    number: number.trim(),
                },
            };
            connection?.send(JSON.stringify(queryBody));
        },
        deleteElement: (id) => {
            const queryBody: deleteContractQuery = {
                type: 'delete',
                url: 'contract',
                targetID: id,
            };
            connection?.send(JSON.stringify(queryBody));
        },
    };

    const deleteContractText = `Удалить договор?
    ВНИМАНИЕ! Удаление договора приведет к
    удалению ВСЕХ связанных с этим контрактом
    устройств в ремонте.`;

    const contractsColumns: ColumnsType<contract> = [
        {
            title: '№ договора',
            dataIndex: 'number',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'number'}
                    type={'text'}
                    key={record.id}
                />
            ),
        },
        {
            title: 'Дата заключения',
            dataIndex: 'date',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'date'}
                    type={'text'}
                    key={record.id}
                />
            ),
        },
        {
            title: 'Действия',
            dataIndex: 'id',
            render: (id, record) => (
                <EditButtons
                    ID={id}
                    methods={buttonsMethods}
                    deleteConfirmTitle={deleteContractText}
                    editingID={editingID}
                    key={id}
                />
            ),
        },
    ];

    return (
        <Form
            form={contractsTableForm}
            className={styles.ContractsTableForm}>
            <Table
                className={styles.ContractsTable}
                dataSource={data}
                size="small"
                pagination={false}
                columns={contractsColumns}
                rowKey={(record) => record.id}
            />
        </Form>
    );
};
