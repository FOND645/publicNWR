import { Form, Input, Table } from "antd";
import { isEqual } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MaterialTableField } from "./MaterialTableField.jsx";
import { EditButtons } from "../common/EditButtons.jsx";
import { dispatchProps } from "../../storage/reducer";

function Component(props) {
    const { route } = props;
    const { defectKey, actionKey } = route;

    const [materialsForm] = Form.useForm();

    const [editKey, setEditKey] = useState();

    const storeDispatch = dispatchProps(useDispatch());

    const materials = useSelector(
        (state) => {
            const { defectsBase } = state;
            const currentDefect = defectsBase.find((defect) => defectKey == defect.key);
            const { actions } = currentDefect;
            const currentAction = actions.find((action) => action.key == actionKey);
            const { materials } = currentAction;
            return materials;
        },
        (oldMaterials, newMaterials) => {
            if (oldMaterials.length != newMaterials.length) return false;
            return isEqual(oldMaterials, newMaterials);
        }
    );

    // Листнер на кнопки устройства в таблице
    function materialEditButtonHandler(event) {
        const { targetKey, action } = event;
        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                setEditKey(false);
                storeDispatch.removeDefectMaterial(defectKey, actionKey, targetKey);
                break;
            case "confirm":
                const count = materialsForm.getFieldValue(targetKey + "_count");
                setEditKey(false);
                storeDispatch.editDefectMaterial(defectKey, actionKey, targetKey, count);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    const columns = [
        {
            title: "Наименование",
            dataIndex: "key",
            key: "name",
            render: (key) => <MaterialTableField route={{ ...route, materialKey: key }} type={"name"} editKey={editKey} />,
        },
        {
            title: "Кол-во",
            dataIndex: "key",
            key: "count",
            render: (key, record) =>
                editKey == key ? (
                    <Form.Item name={key + "_count"} initialValue={record.count}>
                        <Input />
                    </Form.Item>
                ) : (
                    record.count
                ),
        },
        {
            title: "Ед.изм",
            dataIndex: "key",
            key: "unit",
            render: (key) => <MaterialTableField route={{ ...route, materialKey: key }} type={"unit"} editKey={editKey} />,
        },
        {
            title: "Дейсвтия",
            dataIndex: "key",
            key: "actions",
            render: (key) => <EditButtons buttonType={"material_edit"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        document.addEventListener("material_edit", materialEditButtonHandler);

        return () => {
            document.removeEventListener("material_edit", materialEditButtonHandler);
        };
    });

    return (
        <Form form={materialsForm}>
            <Table columns={columns} dataSource={materials} pagination={false} size={"small"} />
        </Form>
    );
}

export const MaterialsTable = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
