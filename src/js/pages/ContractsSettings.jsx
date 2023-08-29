import React, { useEffect } from "react";
import { useState } from "react";
import { Space, Typography, Popconfirm, Button, Form, Divider, Input, AutoComplete } from "antd";
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { contentUnmounted } from "../functions";

const { Title, Text } = Typography;

export function ContractsSettings(props) {
    const contracts = useSelector((store) => store.contracts);
    const [editingKey, setEditingKey] = useState(false);

    const [form] = Form.useForm();

    let organizationsList = new Set();
    contracts.forEach((contr) => {
        organizationsList.add(contr.organizationName);
    });
    organizationsList = Array.from(organizationsList).map((el) => {
        return { value: el };
    });

    console.log(organizationsList);

    // Кнопка редактирования
    function edit(ContrKey) {
        form.setFieldValue({
            ...form.getFieldValue(),
            [ContrKey + "_organizationName"]: "",
            [ContrKey + "_contractNumber"]: "",
            [ContrKey + "_contractDate"]: "",
        });
        setEditingKey(ContrKey);
    }

    // Функция отмены
    function cancle() {
        setEditingKey(false);
    }

    // Функция сохранения изменений
    async function save(contract) {
        const formFields = form.getFieldValue();
        console.log(formFields);
        const organizationName = formFields[contract.key + "_organizationName"]
            ? formFields[contract.key + "_organizationName"]
            : contract.organizationName;
        const contractNumber = formFields[contract.key + "_contractNumber"]
            ? formFields[contract.key + "_contractNumber"]
            : contract.organizationName;
        const contractDate = formFields[contract.key + "_contractDate"] ? formFields[contract.key + "_contractDate"] : contract.contractDate;
        setEditingKey(false);
        props.editContract(contract.key, { organizationName, contractNumber, contractDate });
    }

    // Функция на кнопку удаления контракта
    async function remove(contr) {
        props.removeContract(contr.key);
    }

    // Функция добавления контракта
    async function addContract() {
        props.addContract("ОРГАНИЗАЦИЯ", "01.01.2020 г.", "000000000");
    }

    const component = (
        <Form form={form} component={false}>
            <Space direction="vertical" style={{ width: "100%", padding: "5px" }} id="ContractsSettings">
                <Title level={2}>Редактирование договоров</Title>
                {contracts.map((contr) => {
                    const contrComponent = (
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Space direction="horizontal" align="center" style={{ width: "100%" }}>
                                {editingKey == contr.key ? (
                                    <Space.Compact direction="vertical">
                                        <Button onClick={() => save(contr)}>
                                            <CheckOutlined />
                                        </Button>
                                        <Button onClick={() => cancle()}>
                                            <CloseOutlined />
                                        </Button>
                                    </Space.Compact>
                                ) : (
                                    <Space.Compact direction="vertical">
                                        <Popconfirm
                                            disabled={editingKey}
                                            title="Удалить?"
                                            onConfirm={() => remove(contr)}
                                            description="Вы действительно хотите удалить договор?"
                                            okText="Да"
                                            cancelText="Нет"
                                        >
                                            <Button disabled={editingKey}>
                                                <DeleteOutlined />
                                            </Button>
                                        </Popconfirm>
                                        <Button disabled={editingKey} onClick={() => edit(contr.key)}>
                                            <EditOutlined />
                                        </Button>
                                    </Space.Compact>
                                )}
                                <Space direction="vertical">
                                    <Space direction="horizontal">
                                        <Text strong>Договор № </Text>
                                        {contr.key == editingKey ? (
                                            <Form.Item name={contr.key + "_contractNumber"} style={{ margin: 0 }}>
                                                <Input defaultValue={contr.contractNumber} />
                                            </Form.Item>
                                        ) : (
                                            <Text>{contr.contractNumber}</Text>
                                        )}
                                    </Space>
                                    <Space direction="horizontal">
                                        <Text strong>Дата заключения: </Text>
                                        {contr.key == editingKey ? (
                                            <Form.Item name={contr.key + "_contractDate"} style={{ margin: 0 }}>
                                                <Input defaultValue={contr.contractDate} />
                                            </Form.Item>
                                        ) : (
                                            <Text>{contr.contractDate}</Text>
                                        )}
                                    </Space>
                                    <Space direction="horizontal">
                                        <Text strong>Организация: </Text>
                                        {contr.key == editingKey ? (
                                            <Form.Item
                                                name={contr.key + "_organizationName"}
                                                initialValue={contr.organizationName}
                                                style={{ margin: 0, width: "15rem" }}
                                            >
                                                <AutoComplete options={organizationsList} />
                                            </Form.Item>
                                        ) : (
                                            <Text>{contr.organizationName}</Text>
                                        )}
                                    </Space>
                                </Space>
                            </Space>
                            <Divider style={{ marginTop: "4px", marginBottom: "4px" }} />
                        </Space>
                    );
                    return contrComponent;
                })}
                <Button onClick={() => addContract()}>Добавить договор</Button>
            </Space>
        </Form>
    );

    useEffect(() => {
        return () => {
            contentUnmounted();
        };
    });

    return component;
}

export default ContractsSettings;
