import { Divider, Space, Typography } from "antd";
import React from "react";
import { VERTICAL } from "../../constants";
import { AddExistMaterial } from "./AddExistMaterial.jsx";

import { isEqual } from "lodash";
import { MaterialsTable } from "./MaterialsTable.jsx";
import { AddMaterial } from "../MaterialsBase/AddMaterial.jsx";

const { Title } = Typography;

function Component(props) {
    const { route } = props;

    return (
        <Space.Compact block direction={VERTICAL} style={{ paddingLeft: "2rem" }}>
            <Title level={3}>Использованные материалы</Title>
            <MaterialsTable route={route} />
            <Divider />
            <AddExistMaterial route={route} />
            <AddMaterial />
        </Space.Compact>
    );
}

export const ActionExpand = React.memo(Component, (oldPropd, newProps) => isEqual(oldPropd, newProps));
