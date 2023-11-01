import { Button, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { getDevices } from '../../Devices/Components/DevicesTable';
import { LoadingError } from '../../Common/LoadingError';
import { DefaultOptionType } from 'antd/es/select';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { addRepairDeviceQueryBody } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import { appContext } from '@src/render/context';
import styles from './AddDevice.module.css';
import { unitRepairJSONdata } from './RepairTable';

type props = {
    contractID: number;
};

export const AddDevice: FC<props> = ({ contractID }) => {
    const { data, isError, isLoading, error } = useQuery(
        'database_devices',
        getDevices,
        { refetchOnWindowFocus: false }
    );

    const isUnitContract = contractID === 0;

    const [addDeviceForm] = Form.useForm();
    if (appContext.auth.roots === 'watcher') return null;

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const selectOptions: DefaultOptionType[] =
        data?.map((Device) => {
            const { id, name } = Device;
            return {
                label: name,
                value: id,
            };
        }) || [];

    const addDevice: React.MouseEventHandler<HTMLElement> = () => {
        const repairNumber: number | undefined =
            addDeviceForm.getFieldValue('repairNumber');
        const deviceID: number | undefined =
            addDeviceForm.getFieldValue('deviceID');
        const serialNumber: string =
            addDeviceForm.getFieldValue('serialNumber') || 'б.н.';
        const organization = isUnitContract
            ? addDeviceForm.getFieldValue('organization')
            : null;

        if (deviceID === undefined) {
            dispatchMessage({
                type: 'error',
                content: 'Укажите устройство',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }

        if (!organization && isUnitContract) {
            dispatchMessage({
                type: 'error',
                content: 'Укажите заказчика',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }

        const unitRepairJSONdata: unitRepairJSONdata | null = isUnitContract
            ? {
                  organizationName: organization,
                  progress: [
                      { name: 'Получено письмо', time: false },
                      { name: 'Изделие поступило', time: false },
                      { name: 'Проведена комиссия', time: false },
                      { name: 'На упаковке', time: false },
                      { name: 'Отгружено', time: false },
                  ],
              }
            : null;

        const queryBody: addRepairDeviceQueryBody = {
            type: 'add',
            url: 'repairDevice',
            params: {
                contractID: contractID,
                deviceID: deviceID,
                serialNumber: serialNumber,
                repairNumber: repairNumber,
                unitContractJSON: JSON.stringify(unitRepairJSONdata),
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            form={addDeviceForm}
            className={styles.AddDeviceForm}>
            <Space.Compact className={styles.AddDeviceContainer}>
                <Form.Item
                    className={styles.AddDeviceRepairNumberFormItem}
                    name={'repairNumber'}>
                    <InputNumber
                        className={styles.AddDeviceInput}
                        placeholder="№№"
                        min={1}
                    />
                </Form.Item>

                {isUnitContract ? (
                    <Form.Item
                        name={'organization'}
                        className={styles.AddDeviceOrganization}>
                        <Input
                            placeholder="Заказчик"
                            className={styles.AddDeviceInput}
                        />
                    </Form.Item>
                ) : null}

                <Form.Item
                    className={styles.AddDeviceDeviceIDFormItem}
                    name={'deviceID'}>
                    <Select
                        className={styles.AddDeviceInput}
                        options={selectOptions}
                        placeholder="Выберите изделие"
                    />
                </Form.Item>
                <Form.Item
                    name={'serialNumber'}
                    className={styles.AddDeviceSerialNumberFormItem}>
                    <Input
                        placeholder="Зав. №"
                        className={styles.AddDeviceInput}
                    />
                </Form.Item>
                <Button
                    onClick={addDevice}
                    className={styles.AddDeviceButton}>
                    Добавить изделие в ремонт
                </Button>
            </Space.Compact>
        </Form>
    );
};
