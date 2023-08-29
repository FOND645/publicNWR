import { Space, Typography } from "antd";
import React, { useEffect } from "react";
import { contentUnmounted } from "../functions";
import { isEqual } from "lodash";
import { VERTICAL } from "../constants";
import { UnitRepairTable } from "../components/UnitContracts/UnitRepairTable.jsx";
import { AddUnitDevice } from "../components/UnitContracts/AddUnitDevice.jsx";

const { Text, Title } = Typography;

function Component(props) {
    useEffect(() => {
        return () => {
            contentUnmounted();
        };
    });
    return (
        <Space.Compact block direction={VERTICAL} id="UnitContracts">
            <Title level={2}>Единичный ремонт</Title>
            <UnitRepairTable />
            <AddUnitDevice />
        </Space.Compact>
    );
}

export const UnitContracts = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
