import { getResponseHeader } from '@src/globalFunctions';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { organiztion } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import React, { FC, useState } from 'react';
import { LoadingError } from '../../Common/LoadingError';
import { useQuery } from 'react-query';
import Table, { ColumnsType } from 'antd/es/table';
import { Form, Spin } from 'antd';
import { EditField } from '../../Common/EditField';
import { EditButtons, buttonMethods } from '../../Common/EditButtons';
import { deleteOrganizationQuery } from '@src/server/DELETEqueries';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { editOrganizationQueryBody } from '@src/server/EDITqueries';
import { OrganizationExpand } from './OrganizationExpand';
import styles from './OrganizationsTable.module.css';

type props = {};

function getOrganizations() {
    return new Promise<organiztion[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'organizations',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<organiztion[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const OrganizationsTable: FC<props> = ({}) => {
    const { data, isError, isLoading, error } = useQuery(
        'database_organizations',
        getOrganizations,
        { refetchOnWindowFocus: false }
    );

    const [organizationsTableForm] = Form.useForm();
    const [editingID, setEditingID] = useState<number | false>(false);

    // Катсомное слежение за открытыми expand`ами
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    function expanding(expand: boolean, record: organiztion) {
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

    const deleteOrgText = `Удалить организацию?
    ВНИМНИЕ! Это приведет к удалению всех
    договоров связанных с этой организацией
    и всех устройств в этих договорах.`;

    const organizations = data;

    const buttonsMethods: buttonMethods = {
        setEditing: setEditingID,
        deleteElement: (id) => {
            const queryBody: deleteOrganizationQuery = {
                type: 'delete',
                url: 'organization',
                targetID: id,
            };
            connection?.send(JSON.stringify(queryBody));
        },
        saveChanges: () => {
            const city: string | undefined =
                organizationsTableForm.getFieldValue(`${editingID}_city`);
            const name: string | undefined =
                organizationsTableForm.getFieldValue(`${editingID}_name`);
            if (!name || !city) {
                dispatchMessage({
                    type: 'error',
                    content: 'Введите город и название предприятия',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
                return;
            }
            const queryBody: editOrganizationQueryBody = {
                type: 'edit',
                url: 'organization',
                targetID: editingID as number,
                params: {
                    city: city,
                    name: name,
                },
            };
            connection?.send(JSON.stringify(queryBody));
            setEditingID(false);
        },
    };

    const organizationsColumns: ColumnsType<organiztion> = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'name'}
                    type={'text'}
                    key={record.id}
                />
            ),
        },
        {
            title: 'Город',
            dataIndex: 'city',
            key: 'city',
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'city'}
                    type={'text'}
                    key={record.id}
                />
            ),
        },
        {
            title: 'Действия',
            dataIndex: 'id',
            key: 'actions',
            render: (id, record) => (
                <EditButtons
                    ID={id}
                    methods={buttonsMethods}
                    deleteConfirmTitle={deleteOrgText}
                    editingID={editingID}
                    key={id}
                />
            ),
        },
    ];

    return (
        <Form
            form={organizationsTableForm}
            className={styles.OrganizationsTableForm}>
            <Table
                className={styles.OrganizationsTable}
                dataSource={organizations}
                size="small"
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <OrganizationExpand organizationID={record.id} />
                    ),
                    expandedRowKeys: expandedRows,
                    onExpand: expanding,
                }}
                columns={organizationsColumns}
                rowKey={(record) => record.id}
            />
        </Form>
    );
};
