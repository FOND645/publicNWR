import { Button, Form, Input, InputNumber, Select, Space } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";
import { HORIZONTAL } from "../../constants";

function Component(props) {
    const { route } = props;
    const { defectKey, actionKey } = route;

    const storeDispatch = dispatchProps(useDispatch());

    const [selected, setSelected] = useState({ label: "", value: "", unit: "" });

    const [addMaterialForm] = Form.useForm();

    const materials = useSelector((state) => {
        const { materialsBase } = state;
        return materialsBase;
    });

    const materialsSelect = materials.map((material) => {
        const { name, unit, key } = material;
        return {
            label: name,
            value: key,
            unit,
        };
    });

    function searching(text, option) {
        const { label } = option;
        return label.toLowerCase().includes(text.toLowerCase());
    }

    function addMaterial() {
        const { materialKey, count } = addMaterialForm.getFieldsValue();
        storeDispatch.addDefectMaterial(defectKey, actionKey, materialKey, count);
    }

    return (
        <Form form={addMaterialForm} style={{ width: "100%" }}>
            <Space.Compact block direction={HORIZONTAL} style={{ display: "flex" }}>
                <Form.Item name={"materialKey"} style={{ flexGrow: 1 }}>
                    <Select
                        placeholder={"Выберите материал"}
                        showSearch
                        options={materialsSelect}
                        filterOption={searching}
                        onSelect={(_, option) => setSelected(option)}
                    />
                </Form.Item>
                <Form.Item name={"count"} style={{ width: "4rem", flexGrow: 0 }}>
                    <InputNumber placeholder="К-во" min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Input placeholder={selected.unit} disabled style={{ width: "4rem", flexGrow: 0 }} />
                <Button onClick={addMaterial}>Добавить материал</Button>
            </Space.Compact>
        </Form>
    );
}

export const AddExistMaterial = React.memo(Component, (oldPropd, newProps) => isEqual(oldPropd, newProps));
