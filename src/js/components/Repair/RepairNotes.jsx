import React, { useState, useEffect } from "react";
import { Form, Table } from "antd";

import { RepairNoteText } from "./RepairNoteText.jsx";
import { EditButtons } from "../common/EditButtons.jsx";
import { formatDate } from "../../functions.js";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { dispatchProps } from "../../storage/reducer.js";

function Component(props) {
    // console.log("Наичнием рендерить RepairNotes");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey } = route;

    const notes = useSelector(
        (state) => {
            const { contracts } = state;
            const currentContract = contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            const currentDevice = repairBase.find((device) => device.key == deviceKey);
            const { notes } = currentDevice;
            return notes;
        },
        (oldState, newState) => {
            if (oldState.length != newState.length) return false;
            for (let i = 0; i < oldState.length; i++) {
                if (oldState[i].text != newState[i].length) return false;
            }
            return true;
        }
    );

    const storeDispatch = dispatchProps(useDispatch());

    const [noteForm] = Form.useForm();

    const [editKey, setEditKey] = useState(false);

    // Листнер на кнопки редактирования
    function noteEditButtonHandler(event) {
        const { targetKey, action } = event;
        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                setEditKey(false);
                storeDispatch.removeRepairNote(contractKey, deviceKey, targetKey);
                break;
            case "confirm":
                const text = noteForm.getFieldValue(targetKey + "_noteText").trim();
                setEditKey(false);
                storeDispatch.editRepairSubDevice(contractKey, deviceKey, targetKey, text);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    const notesColumns = [
        {
            title: "Время",
            dataIndex: "date",
            key: "date",
            render: (date) => formatDate(date),
            width: "6rem",
            style: { padding: 0 },
        },
        {
            title: "Запись",
            dataIndex: "key",
            key: "text",
            render: (key, record) => <RepairNoteText route={{ ...route, noteKey: key }} record={record} editKey={editKey} />,
        },
        {
            title: "Действия",
            dataIndex: "key",
            key: "actions",
            render: (key) => <EditButtons buttonType={"note_edit_button"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        // Ставим слушатели сбытий
        document.addEventListener("note_edit_button", noteEditButtonHandler);

        return () => {
            document.removeEventListener("note_edit_button", noteEditButtonHandler);
        };
    });

    return (
        <Form form={noteForm}>
            <Table dataSource={notes} columns={notesColumns} pagination={false} />
        </Form>
    );
}

export const RepairNotes = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
