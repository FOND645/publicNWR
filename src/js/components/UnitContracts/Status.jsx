import { Typography } from "antd";
import { blue } from '@ant-design/colors';
import React from "react";
import { useSelector } from "react-redux";
import { isEqual } from "lodash";

const {Text} = Typography

function Component(props) {
    const {deviceKey} = props
    const lastEvent = useSelector(state => {
        const {unitContracts} = state
        const currentDevice = unitContracts.find(device => device.key == deviceKey)
        const {progress} = currentDevice
        for (let i = progress.lenth - 1; i >= 0; i++) {
            if (progress[i].date) return progress[i]
        }
    },
    (oldEvent, newEvent) => oldEvent.event == newEvent.event)

    return <Text code color="">{lastEvent.event}</Text>
}

export const Status = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps))