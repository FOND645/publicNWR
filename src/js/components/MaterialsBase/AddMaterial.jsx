import { Button, Form, Input, Select, Space } from "antd";
import React from "react";
import { dispatchProps } from "../../storage/reducer";
import { useDispatch } from "react-redux";
import { isEqual } from "lodash";
import { units } from "../../constants";

function Component(props) {
    const [addMaterialForm] = Form.useForm();

    const storeDispatch = dispatchProps(useDispatch());

    function addMaterial() {
        const name = addMaterialForm.getFieldValue("name");
        const unit = addMaterialForm.getFieldValue("unit");

        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

        if (!name || !unit) {
            errorEvent.description = {
                type: "error",
                content: "Введите наименование и ед. измерения материала",
                duration: 3,
            };
            document.dispatchEvent(errorEvent);
            return;
        }

        storeDispatch.addMaterial(name, unit);
    }

    return (
        <Form form={addMaterialForm} style={{ width: "100%" }}>
            <Space.Compact direction={"horizontal"} style={{ width: "100%", display: "flex" }}>
                <Form.Item name={"name"} style={{ flexGrow: 1 }}>
                    <Input placeholder="Введите название материала" />
                </Form.Item>
                <Form.Item name={"unit"} style={{ width: "6rem", flexGrow: 0 }}>
                    <Select options={units} placeholder={"ед.изм."} style={{ width: "100%" }} />
                </Form.Item>
                <Button onClick={addMaterial} style={{ flexGrow: 0 }}>
                    Добавить новый материал
                </Button>
            </Space.Compact>
        </Form>
    );
}

export const AddMaterial = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
