import { Space, Typography, message } from "antd";
import React, { useEffect } from "react";
import { DefectsTable } from "../components/DefectsBaseEditor/DefectsTable.jsx";
import { AddDefect } from "../components/DefectsBaseEditor/AddDefect.jsx";
import { isEqual } from "lodash";
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
        <Space.Compact block direction={"vertical"}>
            {contextHolder}
            <Title level={2}>База неисправностей</Title>
            <DefectsTable />
            <AddDefect />
        </Space.Compact>
    );
}

export const DefectsBaseEditor = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
