import { AutoComplete, Button, Form, Input, Space } from "antd";
import React, { useState } from "react";
import { HORIZONTAL } from "../../constants";
import { dispatchProps } from "../../storage/reducer";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { getRandomKey } from "../../classes";

function Component(props) {
    const { defectKey } = props;

    const storeDispatch = dispatchProps(useDispatch());

    const cuurentDeviceKey = useSelector(
        (state) => {
            const { defectsBase } = state;
            const currenDefect = defectsBase.find((defect) => defect.key == defectKey);
            const { deviceKey } = currenDefect;
            return deviceKey;
        },
        (oldKey, newKey) => oldKey == newKey
    );

    const existedOptions = useSelector(
        (state) => {
            const { defectsBase } = state;
            let relevantDefects = defectsBase.filter((defect) => defect.deviceKey == cuurentDeviceKey);
            let result = new Set();
            relevantDefects.forEach((defect) => {
                const { actions } = defect;
                actions.forEach((action) => result.add(action.action));
            });
            result = Array.from(result).map(value => {
                return {
                    value,
                    label: value,
                    key: getRandomKey()
                }
            })
            return result;
        },
        (oldActions, newActions) => isEqual(oldActions, newActions)
    );

    const [options, setOptions] = useState([]);

    const [addActionForm] = Form.useForm();

    function addNewAction() {
        const index = addActionForm.getFieldValue("index").trim();
        const action = addActionForm.getFieldValue("action").trim();
        storeDispatch.addDefectAction(defectKey, index, action);
    }

    function searching(text) {
        if (!text) {
            setOptions([]);
            return;
        }
        setOptions(existedOptions.filter((option) => option.label.toLowerCase().includes(text.toLowerCase())));
    }

    return (
        <Form form={addActionForm} style={{ width: "100%" }}>
            <Space.Compact block direction={HORIZONTAL} style={{ display: "flex" }}>
                <Form.Item name={"index"} style={{ width: "10rem", flexGrow: 0 }}>
                    <Input placeholder="Индекс" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"action"} style={{ flexGrow: 1 }}>
                    <AutoComplete onSearch={searching} options={options} placeholder="Введите новое действие" style={{ width: "100%" }} />
                </Form.Item>
                <Button onClick={addNewAction} style={{ flexGrow: 0 }}>
                    Добавить новое действие
                </Button>
            </Space.Compact>
        </Form>
    );
}

export const AddNewAction = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
