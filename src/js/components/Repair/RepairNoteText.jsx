import { Form, Input, Typography } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

const { Text } = Typography;

function Component(props) {
    // console.log("Начинаю рендерить RepairNoteText");
    // console.log("Props:");
    // console.log(props);
    const { route, editKey } = props;
    const { contractKey, deviceKey, noteKey } = route;

    const currentNote = useSelector(
        (state) => {
            const currentContract = state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            const currentDevice = repairBase.find((device) => device.key == deviceKey);
            const { notes } = currentDevice;
            const currentNote = notes.find((note) => note.key == noteKey);
            return currentNote;
        },
        (oldNote, newNote) => {
            return oldNote.text == newNote.text;
        }
    );

    const { text } = currentNote;

    let component =
        noteKey == editKey ? (
            <Form.Item name={noteKey + "_noteText"} initialValue={text}>
                <Input />
            </Form.Item>
        ) : (
            <Text>{text}</Text>
        );

    return component;
}

export const RepairNoteText = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
