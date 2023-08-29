import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Form, Input, Row, Select, Space, Typography } from "antd";
import { isEqual } from "lodash";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";

const { Text } = Typography;

function Component(props) {
    const { defectKey } = props;

    const [defectForm] = Form.useForm();

    const storeDispatch = dispatchProps(useDispatch());

    const currentDefect = useSelector(
        (state) => {
            const { defectsBase } = state;
            const currenDefect = defectsBase.find((defect) => defect.key == defectKey);
            return currenDefect;
        },
        (oldDefect, newDefect) => {
            const fiedlToCheck = ["defect", "solution", "description", "key"];
            for (let i = 0; i < fiedlToCheck.length; i++) {
                if (oldDefect[fiedlToCheck[i]] != newDefect[fiedlToCheck[i]]) return false;
            }
            return true;
        }
    );

    const devicesBase = useSelector(
        (state) => {
            const { devicesBase } = state;
            let result = [];
            devicesBase.forEach((device) => {
                const { name, key, includes, decimal } = device;
                result.push({ label: name, value: key, decimal });
                includes.forEach((subDevice) => {
                    const { name, key, decimal } = subDevice;
                    result.push({ label: `=> ${name}`, value: key, decimal });
                });
            });
            return result;
        },
        (oldBase, newBase) => isEqual(oldBase, newBase)
    );

    const [currentDeviceKey, setCurrentDeviceKey] = useState(currentDefect.deviceKey);
    const currentDevice = devicesBase.find((device) => device.value == currentDeviceKey);

    const [editing, setEditing] = useState(false);

    function field(fieldName) {
        return editing ? (
            <Form.Item name={fieldName} initialValue={currentDefect[fieldName]}>
                <Input size={"small"} />
            </Form.Item>
        ) : (
            currentDefect[fieldName]
        );
    }

    function selectDevice() {
        return editing ? (
            <Form.Item name={"deviceKey"} initialValue={currentDeviceKey}>
                <Select options={devicesBase} onChange={(key) => setCurrentDeviceKey(key)} size={"small"} />
            </Form.Item>
        ) : (
            currentDevice.label
        );
    }

    function editButton() {
        const confirmChanges = () => {
            const deviceKey = defectForm.getFieldValue("deviceKey")
            const solution = defectForm.getFieldValue("solution").trim()
            const description = defectForm.getFieldValue("description").trim()
            const defect = defectForm.getFieldValue("defect").trim()
            storeDispatch.editDefect(defectKey, { deviceKey, solution, description, defect });
            setEditing(false);
        };
        return editing ? (
            <Space.Compact>
                <Button size={"small"} onClick={() => confirmChanges()}>
                    <CheckOutlined />
                </Button>
                <Button size={"small"} onClick={() => setEditing(false)}>
                    <CloseOutlined />
                </Button>
            </Space.Compact>
        ) : (
            <Button size={"small"} onClick={() => setEditing(true)}>
                <EditOutlined size={"small"} />
            </Button>
        );
    }

    return (
        <Form form={defectForm}>
            <Divider children={editButton()} orientation="left" />
            <Row style={{ minHeight: "32px" }} align={"middle"}>
                <Col span={4}>
                    <Text strong>Изделие:</Text>
                </Col>
                <Col span={12}>{selectDevice()}</Col>
            </Row>
            <Row style={{ minHeight: "32px" }} align={"middle"}>
                <Col span={4}>
                    <Text strong>Децимальный номер:</Text>
                </Col>
                <Col span={12}>{currentDevice.decimal}</Col>
            </Row>
            <Row style={{ minHeight: "32px" }} align={"middle"}>
                <Col span={4}>
                    <Text strong>Краткое описание:</Text>
                </Col>
                <Col span={12}>{field("description")}</Col>
            </Row>
            <Row style={{ minHeight: "32px" }} align={"middle"}>
                <Col span={4}>
                    <Text strong>Описание дефекта:</Text>
                </Col>
                <Col span={12}>{field("defect")}</Col>
            </Row>
            <Row style={{ minHeight: "32px" }} align={"middle"}>
                <Col span={4}>
                    <Text strong>Решение по дефекту:</Text>
                </Col>
                <Col span={12}>{field("solution")}</Col>
            </Row>
        </Form>
    );
}

export const DefectDescription = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
