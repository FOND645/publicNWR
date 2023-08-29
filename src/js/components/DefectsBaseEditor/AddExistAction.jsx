import { AutoComplete, Form } from "antd";
import { isEqual } from "lodash";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";
import { getRandomKey } from "../../classes";

function Component(props) {
    const { defectKey } = props;

    const [addExistActionForm] = Form.useForm()

    const currentDeviceKey = useSelector(
        (state) => {
            const { defectsBase } = state;
            const currenDefect = defectsBase.find((defect) => defect.key == defectKey);
            const { deviceKey } = currenDefect;
            return deviceKey;
        },
        (oldKey, newKey) => oldKey == newKey
    );

    const relevantActions = useSelector(
        (state) => {
            const { defectsBase } = state;
            const relevantDefects = defectsBase.filter((defect) => defect.deviceKey == currentDeviceKey);
            let result = [];
            relevantDefects.forEach((defect) => {
                const { actions } = defect;
                actions.forEach((action) =>
                    result.push({
                        key: getRandomKey(),
                        defectKeyLink: defect.key,
                        actionKeyLink: action.key,
                        value: `${action.index}: ${action.action}`,
                    })
                );
            });
            return result;
        },
        (oldResult, newResult) => isEqual(oldResult, newResult)
    );

    const [options, setOptions] = useState([]);
    console.log(options)

    const storeDispatch = dispatchProps(useDispatch());

    function searching(value) {
        if (!value) {
            setOptions([]);
            return;
        }
        setOptions(relevantActions.filter((action) => action.value.toLowerCase().includes(value.toLowerCase())));
    }

    function addDefect(value, options) {
        const { defectKeyLink, actionKeyLink } = options;
        addExistActionForm.setFieldsValue({field: ""})
        storeDispatch.addExistDefectAction(defectKey, defectKeyLink, actionKeyLink);
    }

    return (
        <Form form={addExistActionForm}>
            <Form.Item name={"field"}>
                <AutoComplete options={options} onSearch={searching} onSelect={addDefect} />
            </Form.Item>
        </Form>
    );
}

export const AddExistAction = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
