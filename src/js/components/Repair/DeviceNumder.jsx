import { Checkbox, Form, InputNumber, Space } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

function Component(props) {
    // console.log("Начинаяю рендеририть DeviceNumber");
    // console.log("Props:");
    // console.log(props);
    const { route, checkedDevices, editKey } = props;
    const { contractKey, deviceKey } = route;

    const currentDevice = useSelector(
        (state) => {
            const currentContract = state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            const currentDevice = repairBase.find((device) => device.key == deviceKey);
            return currentDevice;
        },
        (oldDevice, newDevice) => {
            return oldDevice.key == newDevice.key && oldDevice.repairNumber == newDevice.repairNumber;
        }
    );

    const { key, repairNumber } = currentDevice;

    // Функция создающая событие нажатия на чекбокс
    function checkboxClicked(event) {
        console.log("Начинаю рендерить checkboxClicked");
        const { target } = event;
        const {checked } = target
        let deviceChecked = new Event("device_checked", { bubbles: true, composed: true });
        deviceChecked.checked = checked;
        deviceChecked.key = key;
        document.dispatchEvent(deviceChecked);
    }

    return (
        <Space size={"small"} align="centre" direction="horizontal">
            <Checkbox checked={checkedDevices.includes(key)} onChange={checkboxClicked} />
            {editKey == key ? (
                <Form.Item name={key + "_repairNumber"} initialValue={repairNumber} style={{ width: "4rem" }}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
            ) : (
                repairNumber
            )}
        </Space>
    );
}

export const DeviceNumber = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
