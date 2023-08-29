import { Space, Typography, message } from "antd";
import React, { useEffect } from "react";
import { DevicesTable } from "../components/DevicesBaseEditor/DevicesTable.jsx";
import { AddDevice } from "../components/DevicesBaseEditor/AddDevice.jsx";
import { isEqual } from "lodash";
import { Provider } from "react-redux";
import { store } from "../storage/reducer";
import { contentUnmounted } from "../functions.js";

const { Title } = Typography;

function Component(props) {
    const [messageApi, contextHolder] = message.useMessage();

    function messageHandler(event) {
        const { description } = event;
        messageApi.open(description);
    }

    useEffect(() => {
        document.addEventListener("page_notification", messageHandler);
        return () => {
            document.removeEventListener("page_notification", messageHandler);
            contentUnmounted();
        };
    });

    return (
        <Provider store={store}>
            {contextHolder}
            <Title level={2}>База изделий</Title>
            <Space.Compact direction="vertical" style={{ width: "100%" }}>
                <DevicesTable />
                <AddDevice />
            </Space.Compact>
        </Provider>
    );
}

export const DevicesBaseEditor = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
