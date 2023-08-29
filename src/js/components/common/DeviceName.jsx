import { Typography } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

const {Text} = Typography

function Component(props) {
    const {deviceKey} = props

    const currentDevice = useSelector(state => {
        const {devicesBase} = state
        for(let device of devicesBase) {
            if (device.key == deviceKey) return device
            for (let subDevice of device.includes) {
                if (subDevice.key == deviceKey) return subDevice
            }
        }
    },
    (oldDevice, newDevice) => oldDevice.name == newDevice.name)

    const {name} = currentDevice

    return (<Text>{name}</Text>)
}

export const DeviceName = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps))