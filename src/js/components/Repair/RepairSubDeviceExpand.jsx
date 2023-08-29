import { Space } from "antd";
import React from "react";
import { store } from "../../storage/reducer";
import { Provider, useSelector } from "react-redux";
import { RepairDefectItem } from "./RepairDefectItem.jsx";
import { isEqual } from "lodash";
import { RepairAddDefect } from "./RepairAddDefect.jsx";

function Component(props) {
    // console.log("Начинаю рендерить RepairSubDeviceExpand");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey, subDeviceKey } = route;

    // Ищем текущее устройство в базе контрактов
    const currentSubDevice = useSelector(
        (state) => {
            const currentContract = state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            const currentDevice = repairBase.find((device) => device.key == deviceKey);
            const { subDevices } = currentDevice;
            return subDevices.find((subDevice) => subDevice.key == subDeviceKey);
        },
        (oldSubDevice, newSubDevice) => {
            console.log("Вызвана переотрисовка RepairSubDeviceExpand")
            console.log("States:", oldSubDevice, newSubDevice)
            console.log(isEqual(oldSubDevice.defects, newSubDevice.defects))
            return isEqual(oldSubDevice.defects, newSubDevice.defects)
        }
    );

    const { defects } = currentSubDevice;

    return (
        <Space direction={"vertical"} style={{ width: "100%" }}>
            {defects.map((defectKey) => {
                return (
                    <Provider store={store}>
                        <RepairDefectItem route={route} defectKey={defectKey} />
                    </Provider>
                );
            })}
            <RepairAddDefect route={route} />
        </Space>
    );
}

export const RepairSubDeviceExpand = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
