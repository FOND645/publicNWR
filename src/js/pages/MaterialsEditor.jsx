import { Divider, Space, Typography } from "antd";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../storage/reducer";
import { MaterialsTable } from "../components/MaterialsBase/MaterialsTable.jsx";
import { AddMaterial } from "../components/MaterialsBase/AddMaterial.jsx";
import { isEqual } from "lodash";
import { contentUnmounted } from "../functions";

const { Title } = Typography;

function Component(props) {
    useEffect(() => {
        return () => {
            contentUnmounted();
        };
    });

    return (
        <Provider store={store}>
            <Space.Compact direction="vertical" style={{ width: "100%" }}>
                <Title level={2}>База материалов</Title>
                <Divider />
                <MaterialsTable />
                <AddMaterial />
            </Space.Compact>
        </Provider>
    );
}

export const MaterialsEditor = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
