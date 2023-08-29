import { Button, Form, Input, Space } from "antd";
import React from "react";
import { dispatchProps } from "../../storage/reducer";
import { useDispatch } from "react-redux";
import { isEqual } from "lodash";

function Component(props) {
    // console.log("Начинаю рендерить RepairAddNote");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey } = route;

    const [addNoteForm] = Form.useForm();

    const storeDispatch = dispatchProps(useDispatch());

    function addNote() {
        const text = addNoteForm.getFieldValue("text");

        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

        // Валидируем и если есть проблемы - создаем событие с ошибкой валидации и готовым сообщением
        if (!text) {
            errorEvent.description = {
                type: "error",
                content: "Введите примечание",
                duration: 3,
            };
            document.dispatchEvent(errorEvent);
            return;
        }
        storeDispatch.addRepairNote(contractKey, deviceKey, text.trim());
    }

    return (
        <Form form={addNoteForm}>
            <Space.Compact>
                <Form.Item name={"text"}>
                    <Input placeholder="Введите примечание" />
                </Form.Item>
                <Button onClick={addNote}>Добавить примечание</Button>
            </Space.Compact>
        </Form>
    );
}

export const RepairAddNote = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
