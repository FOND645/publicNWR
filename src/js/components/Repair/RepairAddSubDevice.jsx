import { Button, Form, Input, InputNumber, Select, Space } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";

function Component(props) {
    // console.log("Начинаю рендерить RepairAddSubDevice");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;

    // Ищем текущее устройство в базе контрактов
    const currentDevice = useSelector((state) => {
        const currentContract = state.contracts.find((contract) => contract.key == route.contractKey);
        const { repairBase } = currentContract;
        return repairBase.find((device) => device.key == route.deviceKey);
    });

    const { deviceKey } = currentDevice;

    const [addSubDeviceForm] = Form.useForm();

    // Извлекаем хранилище - Ищем в базе устройств текущее
    const currentDeviceInBase = useSelector((state) => state.devicesBase.find((dev) => deviceKey == dev.key));

    const storeDispatch = dispatchProps(useDispatch());

    // Создаем массив со всеми устройствами
    let subDevices = [
        { value: currentDeviceInBase.key, label: currentDeviceInBase.name },
        ...currentDeviceInBase.includes.map((subDev) => {
            const { key, name } = subDev;
            return { value: key, label: name };
        }),
    ];

    function addBlock() {
        const fields = addSubDeviceForm.getFieldsValue();
        const { subDeviceKey, count, serialNumber } = fields;
        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

        // Валидируем и если есть проблемы - создаем событие с ошибкой валидации и готовым сообщением
        if (!subDeviceKey) {
            errorEvent.description = {
                type: "error",
                content: "Не указано устройство для добавления",
                duration: 3,
            };
            document.dispatchEvent(errorEvent);
            return;
        }
        if (!serialNumber) {
            errorEvent.description = {
                content: "Не указан заводской номер. Добавлено без номера (б/н)",
                duration: 3,
            };
            document.dispatchEvent(errorEvent);
        }
        storeDispatch.addRepairSubDevice(route.contractKey, route.deviceKey, subDeviceKey, serialNumber.trim(), count);
    }

    return (
        <Form form={addSubDeviceForm} style={{ width: "100%" }}>
            <Space.Compact direction={"horizontal"} style={{ width: "100%", display: "flex" }}>
                <Form.Item name={"subDeviceKey"} style={{ flexGrow: 1 }}>
                    <Select options={subDevices} placeholder={"Выберите блок"} />
                </Form.Item>
                <Form.Item name={"count"} initialValue={1} style={{ width: "4rem", flexGrow: 0 }}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"serialNumber"} style={{ width: "8rem", flexGrow: 0 }}>
                    <Input placeholder={"Зав. №"} />
                </Form.Item>
                <Button onClick={addBlock} style={{ flexGrow: 0 }}>
                    Добавить блок
                </Button>
            </Space.Compact>
        </Form>
    );
}

export const RepairAddSubDevice = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
