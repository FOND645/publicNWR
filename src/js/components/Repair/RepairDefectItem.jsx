import { DeleteOutlined } from "@ant-design/icons";
import { Button, Collapse, Divider, Space, Typography } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";
import { isEqual } from "lodash";

const { Text } = Typography;

function Component(props) {
    // console.log("Начинаем рендерить RepairDefectItem");
    // console.log("Props:");
    // console.log(props);
    const { route, defectKey } = props;
    const { contractKey, deviceKey, subDeviceKey } = route;

    const storeDispatch = dispatchProps(useDispatch());

    const currentDefect = useSelector((state) => state.defectsBase.find((defect) => defect.key == defectKey));
    const materialsBase = useSelector((state) => state.materialsBase);

    function deleteDefect() {
        storeDispatch.removeRepairDefect(contractKey, deviceKey, subDeviceKey, defectKey);
    }

    const { description, defect, solution, actions } = currentDefect;

    const children = (
        <Space direction="vertical">
            <Space.Compact direction="vertical">
                <Text strong>Описание дефекта</Text>
                <Text>{defect}</Text>
            </Space.Compact>

            <Space.Compact direction="vertical">
                <Text strong>Решение</Text>
                <Text>{solution}</Text>
            </Space.Compact>

            <Space.Compact direction="vertical">
                <Text strong>Действия</Text>
                {actions.map((act) => {
                    const { action, index, materials } = act;
                    return (
                        <Space.Compact direction="vertical">
                            <Space.Compact direction="horizontal">
                                <Text>{`Индекс: ${index}.`}</Text>
                                <Divider type={"vertical"} />
                                <Text>{`Действие: ${action}`}</Text>
                            </Space.Compact>
                            {materials.map((material) => {
                                const { materialKey, count } = material;
                                const currentMaterial = materialsBase.find((material) => material.key == materialKey);
                                const { name, unit } = currentMaterial;
                                return <Text type={"secondary"}>{`- ${name} - ${count} ${unit}`}</Text>;
                            })}
                            <Divider />
                        </Space.Compact>
                    );
                })}
            </Space.Compact>
        </Space>
    );

    return (
        <Space direction={"horizontal"}>
            <Button onClick={deleteDefect}>
                <DeleteOutlined />
            </Button>
            <Collapse size="small">
                <Collapse.Panel header={description} key={defectKey}>
                    {children}
                </Collapse.Panel>
            </Collapse>
        </Space>
    );
}

export const RepairDefectItem = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
