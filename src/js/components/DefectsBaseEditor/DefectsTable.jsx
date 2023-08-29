import { Button, Popconfirm, Table } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DefectTableField } from "./DefectTableField.jsx";
import { DeleteOutlined } from "@ant-design/icons";
import { dispatchProps, store } from "../../storage/reducer.js";
import { DefectExpand } from "./DefectExpand.jsx";

function Component(props) {
    const defects = useSelector(
        (state) => {
            const { defectsBase } = state;
            return defectsBase;
        },
        (oldBase, newBase) => {
            if (oldBase.length != newBase.length) return false;
            for (let i = 0; i < oldBase.length; i++) {
                if (oldBase[i].deviceKey != newBase[i].deviceKey) return false;
                if (oldBase[i].description != newBase[i].description) return false;
            }
            return true;
        }
    );

    const devices = useSelector(
        (state) => {
            const { devicesBase } = state;
            let result = [];
            devicesBase.forEach((device) => {
                result.push({ text: device.name, value: device.key });
                const { includes } = device;
                includes.forEach((subDeivce) => {
                    result.push({ text: `=> ${subDeivce.name}`, value: subDeivce.key });
                });
            });
            return result;
        },
        (oldDevices, newDevices) => isEqual(oldDevices, newDevices)
    );

    const storeDispatch = dispatchProps(useDispatch());

    function removeDefect(key) {
        const { contracts, unitContracts } = store.getState();
        const isDepends = [contracts, unitContracts].reduce((result, obj) => hasDeepProperty(obj, key) || result, false);
        if (isDepends) {
            errorEvent.description = {
                type: "error",
                content: "Данная запись используется",
                duration: 3,
            };
            document.dispatchEvent(errorEvent);
            return;
        }
        storeDispatch.removeDefect(key);
    }

    const columns = [
        {
            title: "Наименование блока",
            dataIndex: "deviceKey",
            key: "name",
            filters: devices,
            onFilter: (value, record) => value == record.deviceKey,
            render: (deviceKey) => <DefectTableField deviceKey={deviceKey} field={"name"} />,
        },
        {
            title: "Дец. номер",
            dataIndex: "deviceKey",
            key: "decimal",
            render: (deviceKey) => <DefectTableField deviceKey={deviceKey} field={"decimal"} />,
        },
        {
            title: "Описание",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Действия",
            dataIndex: "key",
            key: "actions",
            render: (key) => (
                <Popconfirm description={"Вы уверены?"} okText={"Да"} cancelText={"Нет"} onConfirm={() => removeDefect(key)}>
                    <Button>
                        <DeleteOutlined />
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <Table
            dataSource={defects}
            columns={columns}
            size="small"
            pagination={{ position: ["bottomLeft", "topLeft"], size: "small" }}
            expandable={{ expandedRowRender: (record) => <DefectExpand defectKey={record.key} /> }}
            style={{ width: "100%" }}
        />
    );
}

export const DefectsTable = React.memo(Component, (oldPropd, newProps) => isEqual(oldPropd, newProps));
