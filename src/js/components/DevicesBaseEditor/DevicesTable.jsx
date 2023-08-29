import { Form, Input, Table } from "antd";
import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { EditButtons } from "../common/EditButtons.jsx";
import { dispatchProps, store } from "../../storage/reducer";
import { isEqual } from "lodash";
import { DeviceExpand } from "./DeviceExpand.jsx";
import { hasDeepProperty } from "../../functions.js";

function Component(props) {
    const [editKey, setEditKey] = useState();

    const [devicesForm] = Form.useForm();

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

    const devicesBase = useSelector(
        (state) => state.devicesBase,
        (oldBase, newBase) => {
            if (oldBase.length != newBase.length) return false;
            for (let i = 0; i < oldBase.length; i++) {
                if (oldBase[i].name != newBase[i].name) return false;
                if (oldBase[i].decimal != newBase[i].decimal) return false;
                if (oldBase[i].key != newBase[i].key) return false;
            }
            return true;
        }
    );

    const storeDispatch = dispatchProps(useDispatch());

    // Листнер на кнопки устройства в таблице
    function deviceEditButtonHandler(event) {
        const { targetKey, action } = event;
        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });
        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                const { contracts, defectsBase, unitContracts } = store.getState();
                const isDepends = [contracts, defectsBase, unitContracts].reduce((result, obj) => hasDeepProperty(obj, targetKey) || result, false);
                if (isDepends) {
                    errorEvent.description = {
                        type: "error",
                        content: "Данная запись используется",
                        duration: 3,
                    };
                    document.dispatchEvent(errorEvent);
                    return;
                }
                storeDispatch.removeDevice(targetKey);
                break;
            case "confirm":
                const name = devicesForm.getFieldValue(targetKey + "_name");
                const decimal = devicesForm.getFieldValue(targetKey + "_decimal");

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

                storeDispatch.editDevice(targetKey, { name, decimal });
                setEditKey(false);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    function nameField(_, record) {
        const { key, name } = record;
        return key == editKey ? (
            <Form.Item name={key + "_name"} initialValue={name} style={{ width: "100%" }}>
                <Input style={{ width: "100%" }} />
            </Form.Item>
        ) : (
            name
        );
    }

    function decimalField(_, record) {
        const { key, decimal } = record;
        return key == editKey ? (
            <Form.Item name={key + "_decimal"} initialValue={decimal} style={{ width: "100%" }}>
                <Input style={{ width: "100%" }} />
            </Form.Item>
        ) : (
            decimal
        );
    }

    const columns = [
        {
            title: "Наименование",
            dataIndex: "name",
            key: "name",
            render: nameField,
        },
        {
            title: "Децимальный номер",
            dataIndex: "decimal",
            key: "decimal",
            render: decimalField,
        },
        {
            title: "Действия",
            dataIndex: "key",
            key: "actions",
            render: (key) => <EditButtons buttonType={"device_edit"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        document.addEventListener("device_edit", deviceEditButtonHandler);

        return () => {
            document.removeEventListener("device_edit", deviceEditButtonHandler);
        };
    });

    return (
        <Form form={devicesForm}>
            <Table
                dataSource={devicesBase}
                columns={columns}
                pagination={false}
                size={"small"}
                style={{ width: "100%" }}
                expandable={{
                    expandedRowRender: (record) => (
                        <Provider store={store}>
                            <DeviceExpand deviceKey={record.key} />
                        </Provider>
                    ),
                    expandedRowKeys: expandedRows,
                    onExpand: expanding,
                }}
            />
        </Form>
    );
}

export const DevicesTable = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
