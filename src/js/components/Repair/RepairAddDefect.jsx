import { Button, Form, Select, Space } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";
import { isEqual } from "lodash";

function Component(props) {
    // console.log("Начинаем рендерить RepairAddDefect");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey, subDeviceKey } = route;

    const [addDefectForm] = Form.useForm();

    const storeDispatch = dispatchProps(useDispatch());

    const currentSubDevice = useSelector(
        (state) => {
            const currentContract = state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            const currentDevice = repairBase.find((device) => device.key == deviceKey);
            const { subDevices } = currentDevice;
            return subDevices.find((subDevice) => subDevice.key == subDeviceKey);
        },
        (oldSubDevice, newSubDevice) => {
            return oldSubDevice.subDeviceKey == newSubDevice.subDeviceKey;
        }
    );

    const subDevKey = currentSubDevice.subDeviceKey;

    const defectsBase = useSelector(
        (state) => {
            const { defectsBase } = state;
            const filtredBase = defectsBase.filter((defect) => defect.deviceKey == subDevKey);
            const mappedbase = filtredBase.map((defect) => {
                return { label: defect.description, value: defect.key };
            });
            return mappedbase.sort((a, b) => {
                if (a.label > b.label) return 1
                if (a.label < b.label) return -1
                return 0
            });
        },
        (oldDefects, newDefects) => {
            if (oldDefects.length != newDefects.length) return false;
            for (let i = 0; i < oldDefects.length; i++) {
                if (oldDefects[i].description != newDefects[i].description) return false;
            }
            return true;
        }
    );

    function addDefect() {
        const defectKey = addDefectForm.getFieldValue("defectKey");
        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

        // Валидация
        if (!defectKey) {
            errorEvent.description = {
                type: "error",
                content: "Не указана неисправность",
                duration: 3,
            };
            document.dispatchEvent(errorEvent);
            return;
        }
        storeDispatch.addRepairDefect(contractKey, deviceKey, subDeviceKey, defectKey);
    }

    return (
        <Form form={addDefectForm}>
            <Space.Compact direction={"horizontal"} style={{ width: "100%", display: "flex" }}>
                <Form.Item name={"defectKey"} style={{ flexGrow: 1 }}>
                    <Select options={defectsBase} style={{ width: "100%" }} />
                </Form.Item>
                <Button onClick={addDefect} style={{ flexGrow: 0 }}>
                    Добавить неисправность
                </Button>
            </Space.Compact>
        </Form>
    );
}

export const RepairAddDefect = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
