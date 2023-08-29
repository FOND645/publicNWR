import { Space } from "antd";
import React from "react";
import { SubDevicesTable } from "./SubDevicesTable.jsx";
import { AddSubDevice } from "./AddSubDevice.jsx";
import { isEqual } from "lodash";

function Component (props) {
    const {deviceKey} = props

    return (
        <Space direction="vertical" style={{width: "100%"}}> 
            <SubDevicesTable deviceKey={deviceKey} /> 
            <AddSubDevice deviceKey={deviceKey} />
        </Space>
    )
}

export const DeviceExpand = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps))