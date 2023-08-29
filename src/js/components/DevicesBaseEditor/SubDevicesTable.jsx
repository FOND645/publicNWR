import { Form, Input, Table } from "antd";
import { isEqual } from "lodash";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditButtons } from "../common/EditButtons.jsx";
import { dispatchProps } from "../../storage/reducer.js";
import { useEffect } from "react";

function Component(props) {
    const { deviceKey } = props

    const [editKey, setEditKey] = useState()

    const subDevicesBase = useSelector(state => {
        const { devicesBase } = state
        const currentDevice = devicesBase.find(device => device.key == deviceKey)
        const { includes } = currentDevice
        return includes
    },
        (oldDevices, newDevices) => {
            if (oldDevices.length != newDevices.length) return false
            for (let i = 0; i < oldDevices.length; i++) {
                if (oldDevices[i].name != newDevices[i].name) return false
                if (oldDevices[i].decimal != newDevices[i].decimal) return false
                if (oldDevices[i].key != newDevices[i].key) return false
            }
            return true
        }
    )

    const [subDeviceForm] = Form.useForm()

    function nameField(_, record) {
        const { key, name } = record
        return key == editKey ? (
            <Form.Item name={key + "_name"} initialValue={name} style={{ width: "100%" }}>
                <Input style={{ width: "100%" }} />
            </Form.Item>
        ) : (
            name
        )
    }

    function decimalField(_, record) {
        const { key, decimal } = record
        return key == editKey ? (
            <Form.Item name={key + "_decimal"} initialValue={decimal} style={{ width: "100%" }}>
                <Input style={{ width: "100%" }} />
            </Form.Item>
        ) : (
            decimal
        )
    }

    const storeDispatch = dispatchProps(useDispatch())

    // Листнер на кнопки устройства в таблице
    function subDeviceEditButtonHandler(event) {
        const { targetKey, action } = event;
        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                storeDispatch.removeSubDevice(deviceKey, targetKey)
                break;
            case "confirm":
                const name = subDeviceForm.getFieldValue(targetKey + "_name")
                const decimal = subDeviceForm.getFieldValue(targetKey + "_decimal")
                let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

                // Валидируем и если есть проблемы - создаем событие с ошибкой валидации и готовым сообщением
                if (!name || !decimal) {
                    errorEvent.description = {
                        type: "error",
                        content: "Введите наименование и децимальный номер изделия",
                        duration: 3,
                    };
                    document.dispatchEvent(errorEvent);
                    return;
                }

                storeDispatch.editSubDevice(deviceKey, targetKey, { name, decimal });
                setEditKey(false);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    const columns = [
        {
            title: "Наименование",
            dataIndex: "name",
            key: "name",
            render: nameField
        },
        {
            title: "Децимальный номер",
            dataIndex: "decimal",
            key: "decimal",
            render: decimalField
        },
        {
            title: "Действия",
            dataIndex: "key",
            key: "actions",
            render: (key) => <EditButtons buttonType={"sub_device_edit"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        document.addEventListener("sub_device_edit", subDeviceEditButtonHandler)

        return () => {
            document.removeEventListener("sub_device_edit", subDeviceEditButtonHandler)
        }
    })

    return (
        <Form form={subDeviceForm}>
            <Table
                dataSource={subDevicesBase}
                columns={columns}
                showHeader={false}
                style={{ width: "100%", paddingLeft: "2.5rem" }}
                pagination={false}
                size={"small"}
            />
        </Form>
    )
}

export const SubDevicesTable = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps))