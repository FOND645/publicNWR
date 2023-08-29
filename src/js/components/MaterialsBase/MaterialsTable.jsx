import { Form, Input, Table } from "antd";
import { isEqual } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditButtons } from "../common/EditButtons.jsx";
import { dispatchProps, store } from "../../storage/reducer";
import { hasDeepProperty } from "../../functions.js";

function Component(props) {
    const materialsBase = useSelector(
        (state) => {
            const { materialsBase } = state;
            return materialsBase;
        },
        (oldBase, newBase) => {
            console.log("Проверяем");
            if (oldBase.length != newBase.length) return false;
            return isEqual(oldBase, newBase);
        }
    );

    const storeDispatch = dispatchProps(useDispatch());

    const [editKey, setEditKey] = useState();

    const [materialsForm] = Form.useForm();

    // Функция изменения размера страницы
    function setPagination(current, size) {
        console.log(current, size);
    }

    // Листнер на кнопки устройства в таблице
    function materialEditButtonHandler(event) {
        const { targetKey, action } = event;
        console.log(event);
        let errorEvent = new Event("page_notification", { bubbles: true, composed: true });

        switch (action) {
            case "edit":
                setEditKey(targetKey);
                break;
            case "delete":
                const defectBase = store.getState();
                const isDepends = hasDeepProperty(defectBase, targetKey);
                if (isDepends) {
                    errorEvent.description = {
                        type: "error",
                        content: "Данная запись используется",
                        duration: 3,
                    };
                    document.dispatchEvent(errorEvent);
                    return;
                }
                storeDispatch.removeMaterial(targetKey);
                break;
            case "confirm":
                const name = materialsForm.getFieldValue(targetKey + "_name");
                const unit = materialsForm.getFieldValue(targetKey + "_unit");

                // Валидируем и если есть проблемы - создаем событие с ошибкой валидации и готовым сообщением
                if (!name || !unit) {
                    errorEvent.description = {
                        type: "error",
                        content: "Введите наименование и децимальный номер изделия",
                        duration: 3,
                    };
                    document.dispatchEvent(errorEvent);
                    return;
                }

                storeDispatch.editMaterial(targetKey, name, unit);
                setEditKey(false);
                break;
            case "cancle":
                setEditKey(false);
                break;
        }
    }

    function nameField(key, record) {
        const { name } = record;
        return key == editKey ? (
            <Form.Item name={key + "_name"} initialValue={name}>
                <Input />
            </Form.Item>
        ) : (
            name
        );
    }

    function unitField(key, record) {
        const { unit } = record;
        return key == editKey ? (
            <Form.Item name={key + "_unit"} initialValue={unit}>
                <Input />
            </Form.Item>
        ) : (
            unit
        );
    }

    const columns = [
        {
            title: "Наименование",
            dataIndex: "key",
            key: "name",
            sorter: (a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
            },
            render: nameField,
        },
        {
            title: "Ед. измерения",
            dataIndex: "key",
            key: "unit",
            render: unitField,
        },
        {
            title: "Действия",
            dataIndex: "key",
            key: "actions",
            render: (key) => <EditButtons buttonType={"edit_material"} targetKey={key} editKey={editKey} />,
        },
    ];

    useEffect(() => {
        document.addEventListener("edit_material", materialEditButtonHandler);

        return () => {
            document.removeEventListener("edit_material", materialEditButtonHandler);
        };
    });

    return (
        <Form form={materialsForm}>
            <Table
                style={{ width: "100%" }}
                columns={columns}
                pagination={{ position: ["topLeft", "bottomLeft"], onShowSizeChange: setPagination, size: "small" }}
                dataSource={materialsBase}
                size="small"
            />
        </Form>
    );
}

export const MaterialsTable = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
