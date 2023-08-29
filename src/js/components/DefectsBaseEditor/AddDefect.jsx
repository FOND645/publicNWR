import { Button, Form, Input, Select, Space } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";
import { HORIZONTAL } from "../../constants";

function Component(props) {
    const [addDefectForm] = Form.useForm();

    const storeDispatch = dispatchProps(useDispatch());

    const devSelect = useSelector(
        (state) => {
            const { devicesBase } = state;
            let devSelect = [];
            devicesBase.forEach((device) => {
                devSelect.push({ value: device.key, label: device.name });
                const { includes } = device;
                includes.forEach((subDevice) => {
                    devSelect.push({ value: subDevice.key, label: `=> ${subDevice.name}` });
                });
            });
            return devSelect;
        },
        (oldDevs, newDevs) => isEqual(oldDevs, newDevs)
    );

    function addDefect() {
        const deviceKey = addDefectForm.getFieldValue("deviceKey")
        const solution = addDefectForm.getFieldValue("solution").trim()
        const description = addDefectForm.getFieldValue("description").trim()
        const defect = addDefectForm.getFieldValue("defect").trim()
        storeDispatch.addDefect(deviceKey, solution, description, defect);
    }

    return (
        <Form form={addDefectForm} style={{ width: "100%" }}>
            <Space.Compact direction={HORIZONTAL} block style={{ display: "flex" }}>
                <Form.Item name={"deviceKey"} style={{ width: "20rem" }}>
                    <Select options={devSelect} style={{ width: "100%", height: "2rem" }} />
                </Form.Item>
                <Form.Item name={"description"} style={{ flexGrow: 1 }}>
                    <Input.TextArea placeholder="Краткое описание дефекта" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"defect"} style={{ flexGrow: 1 }}>
                    <Input.TextArea placeholder="Описание дефекта" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"solution"} style={{ flexGrow: 1 }}>
                    <Input.TextArea placeholder="Решение" style={{ width: "100%" }} />
                </Form.Item>
                <Button onClick={addDefect} style={{ flexGrow: 0, height: "2rem" }}>
                    Добавить неисправность
                </Button>
            </Space.Compact>
        </Form>
    );
}

export const AddDefect = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
