import { Button, Form, Input, InputNumber, Select, Space } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";

function Component(props) {
    // console.log("Начинаю рендерить RepairAddDevice");
    // console.log("Props:");
    // console.log(props);
    const { contractKey } = props;

    const [addDeviceForm] = Form.useForm();

    // Извлекаем хранилище - БД устройств и текущий контракт
    const currentContract = useSelector((state) => state.contracts.find((contract) => contract.key == contractKey));
    const devicesBase = useSelector((state) => state.devicesBase);

    // Создаем перечень всех устрйоств для селекта
    let devices = [];
    devicesBase.forEach((dev) => {
        devices.push({ value: dev.key, label: dev.name });
    });

    const storeDispatch = dispatchProps(useDispatch());

    function addDevice() {
        const fields = addDeviceForm.getFieldsValue();
        let { deviceKey, serialNumber, repairNumber } = fields;
        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

        // Валидируем и если есть проблемы - создаем событие с ошибкой валидации и готовым сообщением
        if (!deviceKey) {
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
            serialNumber = "б.н."
        }

        // Если не указан номер ремонта то ищем свободный номер
        if (!repairNumber) {
            repairNumber = 1;
            while (true) {
                if (currentContract.repairBase.find((dev) => dev.repairNumber == repairNumber && dev.deviceKey == deviceKey)) {
                    repairNumber++;
                    continue;
                } else {
                    break;
                }
            }
        }
        storeDispatch.addRepairDevice(contractKey, deviceKey, serialNumber, repairNumber);
    }

    return (
        <Form form={addDeviceForm} style={{ width: "100%" }}>
            <Space.Compact style={{ width: "100%", display: "flex" }}>
                <Form.Item name={"repairNumber"} style={{ width: "4rem", flexGrow: 0 }}>
                    <InputNumber placeholder="№№" min={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"deviceKey"} style={{ flexGrow: 1 }}>
                    <Select options={devices} placeholder="Выберите изделие" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"serialNumber"} style={{ width: "8rem", flexGrow: 0 }}>
                    <Input placeholder="Зав. №" style={{ width: "100%" }} />
                </Form.Item>
                <Button onClick={addDevice}>Добавить изделие в ремонт</Button>
            </Space.Compact>
        </Form>
    );
}

export const RepairAddDevice = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
