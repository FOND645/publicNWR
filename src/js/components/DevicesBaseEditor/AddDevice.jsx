import { Button, Form, Input, Space } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { dispatchProps } from "../../storage/reducer";
import { useDispatch } from "react-redux";

function Component(props) {
    const [addDeviceForm] = Form.useForm();

    const storeDispatch = dispatchProps(useDispatch());

    function addDevice() {
        const name = addDeviceForm.getFieldValue("name");
        const decimal = addDeviceForm.getFieldValue("decimal");

        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

        // Валидируем и если есть проблемы - создаем событие с ошибкой валидации и готовым сообщением
        if (!name || !decimal) {
            errorEvent.description = {
                type: "error",
                content: "Введите наименование и децимальный номер",
                duration: 3,
            };
            document.dispatchEvent(errorEvent);
            return;
        }

        storeDispatch.addDevice(name, decimal);
    }

    return (
        <Form form={addDeviceForm} style={{ width: "100%" }}>
            <Space.Compact direction="horizontal" style={{ width: "100%", display: "flex" }}>
                <Form.Item name={"name"} style={{ flexGrow: 1 }}>
                    <Input placeholder="Наименование" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"decimal"} style={{ flexGrow: 1 }}>
                    <Input placeholder="Дец. номер" style={{ width: "100%" }} />
                </Form.Item>
                <Button style={{ flexGrow: 0 }} onClick={addDevice}>
                    Доабвить изделие
                </Button>
            </Space.Compact>
        </Form>
    );
}

export const AddDevice = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
