import { Space, Typography } from "antd";
import React from "react";
import { formatDate } from "../../functions";
import { isEqual } from "lodash";
import { useSelector } from "react-redux";

const { Text } = Typography;

function Component(props) {
    // console.log("Начинаю рендерить RepairDate");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey } = route;

    // Ищем текущее устройство в базе контрактов
    const currentDevice = useSelector(
        (state) => {
            const currentContract = state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            return repairBase.find((device) => device.key == deviceKey);
        },
        (oldDevice, newDevice) => {
            return oldDevice.createTime == newDevice.createTime && oldDevice.changeTime == newDevice.changeTime;
        }
    );
    const { createTime, changeTime } = currentDevice;

    return (
        <Space.Compact direction="vertical">
            <Space.Compact direction="horizontal">
                <Text strong>Внесено в базу: </Text>
                <Text>{formatDate(createTime)}</Text>
            </Space.Compact>
            <Space.Compact direction="horizontal">
                <Text strong>Последнее изменение: </Text>
                <Text>{formatDate(changeTime)}</Text>
            </Space.Compact>
        </Space.Compact>
    );
}

export const RepairDate = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
