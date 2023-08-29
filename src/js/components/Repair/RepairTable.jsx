import React, { useEffect, useState } from "react";
import { useSelector, Provider, useDispatch } from "react-redux";
import { Form, Input, Table, Typography } from "antd";

import { DeviceNumber } from "./DeviceNumder.jsx";
import { RepairDeviceExpand } from "./RepairDeviceExpand.jsx";
import { dispatchProps, store } from "../../storage/reducer.js";
import { EditButtons } from "../common/EditButtons.jsx";
import { isEqual } from "lodash";

const { Text } = Typography;

function Component(props) {
    // console.log("Начинаю рендерить RepairTable");
    // console.log("Props:");
    // console.log(props);
    const { contractKey } = props;

    // Стейт для чекбоксов
    const [checkedDevices, setCheckedDevices] = useState([]);

    // Стейт текущего редактирумого устройства
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

    // Извлекаем хранилище
    const repairBase = useSelector(
        (state) => state.contracts.find((contr) => contr.key == contractKey).repairBase,
        (oldBase, newBase) => {
            if (oldBase.length != newBase.length) return false;
            for (let i = 0; i < oldBase.length; i++) {
                if (oldBase[i].deviceKey != newBase[i].deviceKey) return false;
                if (oldBase[i].key != newBase[i].key) return false;
                if (oldBase[i].repairNumber != newBase[i].repairNumber) return false;
                if (oldBase[i].serialNumber != newBase[i].serialNumber) return false;
            }
            return true;
        }
    );
    const devicesBase = useSelector((state) => state.devicesBase);

    // Перечень всех изделий и их блоков
    let devices = [];
    devicesBase.forEach((dev) => {
        devices.push({ name: dev.name, text: dev.name, decimal: dev.decimal, key: dev.key, value: dev.key });
        dev.includes.forEach((subDev) => {
            devices.push({ name: subDev.name, text: `=> ${subDev.name}`, decimal: subDev.decimal, key: subDev.key, value: subDev.key });
        });
    });

    const storeDispatch = dispatchProps(useDispatch());

    // Создаем форму для основной таблицы
    const [repairTableForm] = Form.useForm();

    // Листнер для чекбоксов номеров
    function checkboxDeviceHandler(event) {
        // При тестировании - проверить что будет в event`e
        const { checked, key } = event;
        if (checked) {
            setCheckedDevices([...checkedDevices, key]);
        } else {
            setCheckedDevices(checkedDevices.filter((k) => k != key));
        }
    }

    // Листнер на кнопки устройства в таблице
    function deviceEditButtonHandler(event) {
        const { targetKey, action } = event;
        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                setEditKey(false);
                storeDispatch.removeRepairDevice(contractKey, targetKey);
                break;
            case "confirm":
                const fields = repairTableForm.getFieldsValue();
                const newDeviceData = {
                    repairNumber: fields[targetKey + "_repairNumber"].trim(),
                    serialNumber: fields[targetKey + "_serialNumber"].trim(),
                };
                setEditKey(false);
                storeDispatch.editRepairDevice(contractKey, targetKey, newDeviceData);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    // Функция изменения размера страницы
    function setPagination(current, size) {
        console.log(current, size);
    }

    // Функция возвращает поле для редактирования или сырое значение поля с завосдким номером
    function serialNumberField(_, record) {
        const { key, serialNumber } = record;
        return key == editKey ? (
            <Form.Item name={key + "_serialNumber"} initialValue={serialNumber}>
                <Input />
            </Form.Item>
        ) : (
            <Text>{serialNumber}</Text>
        );
    }

    // Колонки для таблицы
    const repairColumns = [
        {
            title: "№№",
            dataIndex: "key",
            key: "repairNumber",
            sorter: (a, b) => a.repairNumber - b.repairNumber,
            render: (key) => <DeviceNumber route={{ contractKey, deviceKey: key }} checkedDevices={checkedDevices} editKey={editKey} />,
        },
        {
            title: "Изделие",
            dataIndex: "deviceKey",
            key: "name",
            filters: devicesBase.map((device) => {
                return { text: device.name, value: device.key };
            }),
            onFilter: (value, record) => value == record.deviceKey,
            render: (key) => devices.find((dev) => dev.key == key).name,
        },
        {
            title: "Дец. №",
            dataIndex: "deviceKey",
            key: "decimal",
            filters: devicesBase.map((device) => {
                return { text: device.decimal, value: device.key };
            }),
            onFilter: (value, record) => value == record.deviceKey,
            render: (key) => devices.find((dev) => dev.key == key).decimal,
        },
        {
            title: "Заводской номер",
            dataIndex: "serialNumber",
            key: "serialNumber",
            sorter: (a, b) => a.serialNumber - b.serialNumber,
            render: serialNumberField,
        },
        {
            titler: "Действия",
            dataIndex: "key",
            key: "actions",
            render: (key, record) => <EditButtons buttonType={"device_edit_button"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        // Ставим слушатели сбытий
        document.addEventListener("device_checked", checkboxDeviceHandler);
        document.addEventListener("device_edit_button", deviceEditButtonHandler);

        return () => {
            document.removeEventListener("device_checked", checkboxDeviceHandler);
            document.removeEventListener("device_edit_button", deviceEditButtonHandler);
        };
    });

    return (
        <Provider store={store}>
            <Form form={repairTableForm}>
                <Table
                    dataSource={repairBase}
                    pagination={{ position: ["topLeft", "bottomLeft"], onShowSizeChange: setPagination, size: "small" }}
                    columns={repairColumns}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Provider store={store}>
                                <RepairDeviceExpand route={{ contractKey, deviceKey: record.key }} />
                            </Provider>
                        ),
                        expandedRowKeys: expandedRows,
                        onExpand: expanding,
                    }}
                    size="small"
                />
            </Form>
        </Provider>
    );
}

export const RepairTable = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
