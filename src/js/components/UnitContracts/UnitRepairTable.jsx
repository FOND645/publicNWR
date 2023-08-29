import { isEqual } from "lodash";
import { Table } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { Status } from "./Status.jsx";
import { DeviceName } from "../common/DeviceName.jsx";

function Component(props) {
    const unitContracts = useSelector(state => {
        const {unitContracts} = state
        return unitContracts
    }, 
    (oldContracts, newContracts) => {
        if (oldContracts.length != newContracts.length) return false
        for (let i = 0; i < oldContracts.length; i++) {
            if (oldContracts[i].key != newContracts[i].key) return false
            if (oldContracts[i].deviceKey != newContracts[i].deviceKey) return false
            if (oldContracts[i].serialNumber != newContracts[i].serialNumber) return false
            if (oldContracts[i].organizationName != newContracts[i].organizationName) return false
            if (oldContracts[i].organizationCity != newContracts[i].organizationCity) return false
        }
        return true
    })

    const columns = [
        {
            title: "Наименование изделия",
            dataIndex: "deviceKey",
            key: "deviceName",
            render: (deviceKey) => <DeviceName deviceKey={deviceKey} />
        },
        {
            title: "Зав. №",
            dataIndex: "serialNumber",
            key: "serialNumber",
        },
        {
            title: "Заказчик",
            dataIndex: "key",
            key: "organization",
            render: (_, record) => `${record.organizationName}, г. ${record.organizationCity}`
        },
        {
            title: "Статус",
            dataIndex: "key",
            key: "status",
            render: (_, record) => <Status deviceKey={record.key} />
        }
    ]

    return (<Table columns={columns} dataSource={unitContracts}/>)
}

export const UnitRepairTable = React.memo(Component, (oldProps, neWProps) => isEqual(oldProps, neWProps))