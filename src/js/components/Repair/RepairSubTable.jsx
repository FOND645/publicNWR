import { Form, Input, InputNumber, Table, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { EditButtons } from "../common/EditButtons.jsx";
import { RepairSubDeviceExpand } from "./RepairSubDeviceExpand.jsx";
import { isEqual } from "lodash";
import { dispatchProps, store } from "../../storage/reducer.js";

const { Text } = Typography;

function Component(props) {
    // console.log("Начинаю рендерить RepairSubTable");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey } = route;

    // Ищем массив блоков в базе контрактов
    const currentDevice = useSelector(
        (state) => {
            const currentContract = contractKey == "unitRepair" ? state.unitContracts : state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            const currentDevice = repairBase.find((device) => device.key == deviceKey);
            return currentDevice;
        },
        (oldDevice, newDevice) => {
            console.log("Вызвана переотрисовка RepairSubTable");
            console.log("States:", oldDevice, newDevice);
            if (oldDevice.subDevices.length != newDevice.subDevices.length) return false;
            for (let i = 0; i < oldDevice.subDevices.length; i++) {
                if (oldDevice.subDevices[i].subDeviceKey != newDevice.subDevices[i].subDeviceKey) return false;
                if (oldDevice.subDevices[i].serialNumber != newDevice.subDevices[i].serialNumber) return false;
                if (oldDevice.subDevices[i].count != newDevice.subDevices[i].count) return false;
                if (!isEqual(oldDevice.subDevices[i].defects, newDevice.subDevices[i].defects)) return false;
            }
            return true;
        }
    );

    const { subDevices } = currentDevice;
    const devKey = currentDevice.deviceKey;

    const [editKey, setEditKey] = useState(false);

    // Катсомное слежение за открытыми expand`ами
    const [expandedRows, setExpandedRows] = useState([]);
    function expanding(expand, record) {
        const { key } = record;
        if (expand) {
            setExpandedRows([...expandedRows, key]);
        } else {
            setExpandedRows(expandedRows.filter((row) => row != key));
        }
    }

    const [repairSubTableForm] = Form.useForm();

    // Извлекаем хранилище - текущее устройство в БД устройств
    const currentDeviceInBase = useSelector((state) => state.devicesBase.find((dev) => dev.key == devKey));

    const storeDispatch = dispatchProps(useDispatch());

    // Массив с данными всех блоков для текущего устройства + данные самого устройства
    const subDevicesList = [
        {
            key: currentDeviceInBase.key,
            name: currentDeviceInBase.name,
            decimal: currentDeviceInBase.decimal,
        },
        ...currentDeviceInBase.includes.map((subDev) => {
            const { key, name, decimal } = subDev;
            return { key, name, decimal };
        }),
    ];

    // Листнер на события кнопок
    function subDeviceEditButtonHandler(event) {
        const { targetKey, action } = event;
        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                setEditKey(false);
                storeDispatch.removeRepairSubDevice(contractKey, deviceKey, targetKey);
                break;
            case "confirm":
                const fields = repairSubTableForm.getFieldsValue();
                const serialNumber = fields[targetKey + "_serialNumber"].trim();
                const count = fields[targetKey + "_count"];
                setEditKey(false);
                storeDispatch.editRepairSubDevice(contractKey, deviceKey, targetKey, serialNumber, count);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    // Функция возвращает поле для редактирования или сырое значение поля с количеством
    function countField(_, record) {
        const { key, count } = record;
        return key == editKey ? (
            <Form.Item name={key + "_count"} initialValue={count} style={{ width: "2rem" }}>
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
        ) : (
            <Text code>{count}</Text>
        );
    }

    // Функция возвращает поле для редактирования или сырое значение поля с завосдким номером
    function serialNumberField(_, record) {
        const { key, serialNumber } = record;
        return key == editKey ? (
            <Form.Item name={key + "_serialNumber"} initialValue={serialNumber} style={{ width: "5rem" }}>
                <Input style={{ width: "100%" }} />
            </Form.Item>
        ) : (
            <Text>{serialNumber}</Text>
        );
    }

    const repairSubTableColumns = [
        {
            title: "Изделие",
            dataIndex: "subDeviceKey",
            key: "name",
            render: (subDevKey) => subDevicesList.find((subDev) => subDev.key == subDevKey).name,
        },
        {
            title: "Дец. №",
            dataIndex: "subDeviceKey",
            key: "decimal",
            render: (subDevKey) => subDevicesList.find((subDev) => subDev.key == subDevKey).decimal,
        },
        {
            title: "Кол-во",
            dataIndex: "subDeviceKey",
            key: "count",
            render: countField,
        },
        {
            title: "Зав. №",
            dataIndex: "subDeviceKey",
            key: "serialNumber",
            render: serialNumberField,
        },
        {
            title: "Действия",
            dataIndex: "key",
            key: "action",
            render: (key, record) => <EditButtons buttonType={"sub_device_edit_button"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        // Ставим слушатели сбытий
        document.addEventListener("sub_device_edit_button", subDeviceEditButtonHandler);

        return () => {
            document.removeEventListener("sub_device_edit_button", subDeviceEditButtonHandler);
        };
    });

    return (
        <Form form={repairSubTableForm}>
            <Table
                dataSource={subDevices}
                columns={repairSubTableColumns}
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <Provider store={store}>
                            <RepairSubDeviceExpand route={{ ...route, subDeviceKey: record.key }} />
                        </Provider>
                    ),
                    expandedRowKeys: expandedRows,
                    onExpand: expanding,
                }}
            />
        </Form>
    );
}

export const RepairSubTable = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
