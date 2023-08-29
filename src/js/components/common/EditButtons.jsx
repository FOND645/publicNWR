import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space } from "antd";
import { isEqual } from "lodash";
import React from "react";

function Component(props) {
    // console.log("Начинаю рендерить EditButtons");
    // console.log("Props:");
    // console.log(props);
    const { buttonType, targetKey, editKey } = props;

    // Функция высшего порядка для создания события нажатия на кнопку. action - тип нажатой кнопки
    function eventDispatch(eventType) {
        return function () {
            let event = new Event(buttonType, { bubbles: true, composed: true });
            event.targetKey = targetKey;
            event.action = eventType;
            document.dispatchEvent(event);
        };
    }

    if (editKey == targetKey) {
        return (
            <Space.Compact direction="horizontal">
                <Button onClick={eventDispatch("confirm")}>
                    <CheckOutlined />
                </Button>
                <Button onClick={eventDispatch("cancle")}>
                    <CloseOutlined />
                </Button>
            </Space.Compact>
        );
    } else {
        return (
            <Space.Compact direction="horizontal">
                <Button disabled={editKey} onClick={eventDispatch("edit")}>
                    <EditOutlined disabled={editKey} />
                </Button>
                <Popconfirm disabled={editKey} onConfirm={eventDispatch("delete")} description={"Удалить запись?"} okText={"Да"} cancelText={"Нет"}>
                    <Button disabled={editKey}>
                        <DeleteOutlined disabled={editKey} />
                    </Button>
                </Popconfirm>
            </Space.Compact>
        );
    }
}

export const EditButtons = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
