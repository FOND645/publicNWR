import { DatePicker, Form, Space, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC, ReactNode, useState } from 'react';
import { useQuery } from 'react-query';
import {
    EditButtons,
    buttonMethods,
} from '@src/render/Pages/Common/EditButtons';
import { EditField } from '@src/render/Pages/Common/EditField';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { contractDevices } from '@src/server/GETqueries';
import { editRepairDeviceQueryBody } from '@src/server/EDITqueries';
import { RepairDeviceExpand } from './RepairDeviceExpand';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { deleteRepairDeviceQuery } from '@src/server/DELETEqueries';
import { compareText, getResponseHeader } from '@src/globalFunctions';
import { TableSearcher } from '../../Common/TableSearcher';
import { ColumnType, FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import styles from './RepairTable.module.css';

type props = {
    contractID: number;
};

type progressPoint = {
    name: string;
    time: number | false;
};

export interface unitRepairJSONdata {
    organizationName: string;
    progress: progressPoint[];
}

export interface unitRepairDevice extends contractDevices {
    organizationName: string;
    progress: progressPoint[];
}

function getRepairDevices(contractID: number) {
    return new Promise<contractDevices[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'contractDevices',
            targetID: contractID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<contractDevices[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const RepairTable: FC<props> = ({ contractID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_repair_devices_${contractID}`,
        () => getRepairDevices(contractID),
        { refetchOnWindowFocus: false }
    );

    interface dateFilter {
        lowerDate: number | undefined;
        upperDate: number | undefined;
    }

    const [searchedIDs, setSearchedIDs] = useState<number[] | false>(false);

    const [dateFilter, setDateFilter] = useState<dateFilter>({
        lowerDate: undefined,
        upperDate: undefined,
    });

    const isUnitContract = contractID === 0;

    const [repairTableForm] = Form.useForm();
    const [editingID, setEditingID] = useState<number | false>(false);

    // Катсомное слежение за открытыми expand`ами
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    function expanding(expand: boolean, record: contractDevices) {
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

    const filterDropdown: (props: FilterDropdownProps) => ReactNode = () => {
        const setfilterDate = (type: 'lower' | 'upper') => {
            return (day: dayjs.Dayjs | null) => {
                setDateFilter((previous) => {
                    let newFilter: dateFilter = {
                        ...previous,
                    };
                    const date = day?.toDate().getTime();
                    if (type === 'lower') newFilter.lowerDate = date;
                    if (type === 'upper') newFilter.upperDate = date;
                    return newFilter;
                });
            };
        };

        return (
            <Space.Compact direction="vertical">
                <DatePicker
                    placeholder="От"
                    onChange={setfilterDate('lower')}
                    defaultValue={
                        dateFilter.lowerDate
                            ? dayjs(dateFilter.lowerDate)
                            : undefined
                    }
                />
                <DatePicker
                    placeholder="До"
                    onChange={setfilterDate('upper')}
                    defaultValue={
                        dateFilter.upperDate
                            ? dayjs(dateFilter.upperDate)
                            : undefined
                    }
                />
            </Space.Compact>
        );
    };

    const devices: contractDevices[] | unitRepairDevice[] = isUnitContract
        ? (data
              .filter((Device) => {
                  if (searchedIDs === false) return true;
                  return searchedIDs.includes(Device.id);
              })
              .filter((Device) => {
                  const { lowerDate, upperDate } = dateFilter;
                  const { createTime } = Device;
                  if (lowerDate && createTime < lowerDate) return false;
                  if (upperDate && createTime > upperDate) return false;
                  return true;
              })
              .map((Device) => {
                  const JSONdata: unitRepairJSONdata = JSON.parse(
                      Device.unit_contracts_json as string
                  );
                  const unitDevice: unitRepairDevice = {
                      ...Device,
                      organizationName: JSONdata.organizationName,
                      progress: JSONdata.progress,
                  };
                  return unitDevice;
              }) as unitRepairDevice[])
        : data
              .filter((Device) => {
                  if (searchedIDs === false) return true;
                  return searchedIDs.includes(Device.id);
              })
              .filter((Device) => {
                  const { lowerDate, upperDate } = dateFilter;
                  const { createTime } = Device;
                  if (lowerDate && createTime < lowerDate) return false;
                  if (upperDate && createTime > upperDate) return false;
                  return true;
              });

    const buttonMethods: buttonMethods = {
        setEditing: setEditingID,

        saveChanges: () => {
            const serialNumber: string | undefined =
                repairTableForm.getFieldValue(`${editingID}_serial_number`);
            const repairNumber: number | undefined =
                repairTableForm.getFieldValue(`${editingID}_repair_number`);

            if (!serialNumber || !repairNumber) {
                dispatchMessage({
                    type: 'error',
                    content: 'Введите серийный номер и номер ремонта',
                    duration: VALIDATION_MESSAGE_DURATION,
                });
                return;
            }
            const queryBody: editRepairDeviceQueryBody = {
                type: 'edit',
                url: 'repairDevice',
                targetID: editingID as number,
                params: {
                    repairNumber: repairNumber,
                    serialNumber: serialNumber.trim(),
                },
            };
            connection?.send(JSON.stringify(queryBody));
            setEditingID(false);
        },

        deleteElement(id) {
            const queryBody: deleteRepairDeviceQuery = {
                type: 'delete',
                url: 'repairDevice',
                targetID: id,
            };
            connection?.send(JSON.stringify(queryBody));
        },
    };

    interface Ifilter {
        value: string;
        text: string;
    }

    const getFilters = (
        type: 'name' | 'decimal' | 'serial_number'
    ): Ifilter[] => {
        const set = new Set<string>();
        devices.forEach((Device) => set.add(Device[type]));
        return Array.from(set).map((Element) => {
            return {
                value: Element,
                text: Element,
            };
        });
    };

    function setPagination(current: number, size: number) {}

    // Колонки для таблицы
    const repairColumns: ColumnsType<contractDevices> = [
        {
            title: '№№',
            dataIndex: 'repair_number',
            key: 'repairNumber',
            sorter: (a: contractDevices, b: contractDevices) =>
                a.repair_number - b.repair_number,
            sortDirections: ['ascend', 'descend'],
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'repair_number'}
                    type={'numder'}
                />
            ),
        },
        {
            title: 'Изделие',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: contractDevices, b: contractDevices) =>
                compareText(a.name, b.name),
            sortDirections: ['ascend', 'descend'],
            filters: getFilters('name'),
            filterSearch: true,
            onFilter: ((value: string, record: contractDevices) =>
                record.name.includes(value)) as (
                value: boolean | React.Key,
                record: contractDevices
            ) => boolean,
        },
        {
            title: 'Дец. №',
            dataIndex: 'decimal',
            key: 'decimal',
            sorter: (a: contractDevices, b: contractDevices) =>
                compareText(a.decimal, b.decimal),
            sortDirections: ['ascend', 'descend'],
            filters: getFilters('name'),
            filterSearch: true,
            onFilter: ((value: string, record: contractDevices) =>
                record.name.includes(value)) as (
                value: boolean | React.Key,
                record: contractDevices
            ) => boolean,
        },
        {
            title: 'Заводской номер',
            dataIndex: 'serial_number',
            key: 'serialNumber',
            sorter: (a: contractDevices, b: contractDevices) =>
                compareText(a.serial_number, b.serial_number),
            sortDirections: ['ascend', 'descend'],
            render: (_, record) => (
                <EditField
                    data={record}
                    editingID={editingID}
                    field={'serial_number'}
                    type={'text'}
                />
            ),
        },
        {
            title: 'Добавлено',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (time) =>
                `${new Date(time).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    weekday: 'short',
                })}`,
            sorter: (a: contractDevices, b: contractDevices) =>
                a.createTime - b.createTime,
            sortDirections: ['ascend', 'descend'],
            filterDropdown: filterDropdown,
        },
        {
            title: 'Действия',
            dataIndex: 'id',
            key: 'actions',
            render: (id) => (
                <EditButtons
                    ID={id}
                    deleteConfirmTitle="Удалить изделие из договора?"
                    editingID={editingID}
                    methods={buttonMethods}
                />
            ),
        },
    ];

    // Колонки для единичных договоров
    const unitRepairColumns: ColumnsType<unitRepairDevice> = [
        repairColumns.find(
            (Column) => Column.key === 'repairNumber'
        ) as ColumnType<unitRepairDevice>,
        {
            title: 'Заказчик',
            dataIndex: 'organizationName',
            key: 'organization',
            sorter: (a: contractDevices, b: contractDevices) =>
                compareText(a.name, b.name),
            sortDirections: ['ascend', 'descend'],
            filters: getFilters('name'),
            filterSearch: true,
            onFilter: ((value: string, record: contractDevices) =>
                record.name.includes(value)) as (
                value: boolean | React.Key,
                record: contractDevices
            ) => boolean,
        },
        repairColumns.find(
            (Column) => Column.key === 'name'
        ) as ColumnType<unitRepairDevice>,
        repairColumns.find(
            (Column) => Column.key === 'decimal'
        ) as ColumnType<unitRepairDevice>,
        repairColumns.find(
            (Column) => Column.key === 'serialNumber'
        ) as ColumnType<unitRepairDevice>,
        repairColumns.find(
            (Column) => Column.key === 'createTime'
        ) as ColumnType<unitRepairDevice>,
        repairColumns.find(
            (Column) => Column.key === 'actions'
        ) as ColumnType<unitRepairDevice>,
    ];

    return (
        <Form
            form={repairTableForm}
            className={styles.RepairTableForm}>
            <TableSearcher
                rawData={data}
                setSearchedIDs={setSearchedIDs}
            />
            <Table
                className={styles.RepairTable}
                dataSource={devices as unitRepairDevice[] | contractDevices[]}
                pagination={{
                    position: ['topLeft', 'bottomLeft'],
                    onShowSizeChange: setPagination,
                    size: 'small',
                }}
                columns={
                    (isUnitContract
                        ? unitRepairColumns
                        : repairColumns) as ColumnsType<contractDevices>
                }
                rowKey={(record) => record.id}
                expandable={{
                    expandedRowRender: (record) => (
                        <RepairDeviceExpand
                            unitRepairJSONdata={{
                                progress: (record as unitRepairDevice).progress,
                                organizationName: (record as unitRepairDevice)
                                    .organizationName,
                            }}
                            key={record.id}
                            repairDeviceID={record.id}
                            contractID={contractID}
                        />
                    ),
                    expandedRowKeys: expandedRows,
                    onExpand: expanding,
                }}
                size="small"
            />
        </Form>
    );
};
