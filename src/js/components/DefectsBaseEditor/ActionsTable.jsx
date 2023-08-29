import { Form, Input, Space, Table, Typography } from "antd";
import { isEqual } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditButtons } from "../common/EditButtons.jsx";
import { dispatchProps } from "../../storage/reducer";
import { ActionExpand } from "./ActionExpand.jsx";

const { Title } = Typography;

function Component(props) {
    const { defectKey } = props;

    const storeDispatch = dispatchProps(useDispatch());

    const [actionsForm] = Form.useForm();

    const [editKey, setEditKey] = useState();

    const currentDefect = useSelector(
        (state) => {
            const { defectsBase } = state;
            const currentDefect = defectsBase.find((defect) => defect.key == defectKey);
            return currentDefect;
        },
        (oldDefect, newDefect) => isEqual(oldDefect, newDefect)
    );

    const { actions } = currentDefect;

    // Листнер на кнопки редактирования
    function actionEditButtonHandler(event) {
        const { targetKey, action } = event;
        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                storeDispatch.removeDefectAction(defectKey, targetKey);
                break;
            case "confirm":
                const index = actionsForm.getFieldValue(targetKey + "_index");
                const action = actionsForm.getFieldValue(targetKey + "_action");
                storeDispatch.editDefectAction(defectKey, targetKey, { action, index });
                setEditKey(false);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    function field(record, type) {
        const { key, index, action } = record;
        return key == editKey ? (
            <Form.Item name={`${key}_${type}`} initialValue={record[type]} style={{ width: "100%" }}>
                <Input />
            </Form.Item>
        ) : (
            record[type]
        );
    }

    const columns = [
        {
            title: "Индекс",
            dataIndex: "index",
            index: "index",
            render: (_, record) => field(record, "index"),
        },
        {
            title: "Действие",
            dataIndex: "action",
            index: "action",
            render: (_, record) => field(record, "action"),
        },
        {
            title: "Ред.",
            dataIndex: "key",
            index: "edit",
            render: (key) => <EditButtons buttonType={"action_edit"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        document.addEventListener("action_edit", actionEditButtonHandler);
        return () => {
            document.removeEventListener("action_edit", actionEditButtonHandler);
        };
    });

    return (
        <Form form={actionsForm}>
            <Table
                dataSource={actions}
                columns={columns}
                size="small"
                pagination={false}
                expandable={{ expandedRowRender: (record) => <ActionExpand route={{ defectKey, actionKey: record.key }} /> }}
            />
        </Form>
    );
}

export const ActionsTable = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
