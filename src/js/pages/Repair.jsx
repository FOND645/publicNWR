import { Divider, Space, message } from "antd";
import React, { useEffect, useState } from "react";
import { Provider, useSelector } from "react-redux";

import { ContractHead } from "../components/Repair/ContractHead.jsx";
import { store } from "../storage/reducer.js";
import { RepairTable } from "../components/Repair/RepairTable.jsx";
import { RepairAddDevice } from "../components/Repair/RepairAddDevice.jsx";
import { isEqual } from "lodash";
import { contentUnmounted } from "../functions.js";
import { GroupAction } from "../components/Repair/GroupAction.jsx";
import { HORIZONTAL } from "../constants.js";
import { GroupActionProgress } from "../components/Repair/GroupActionProgress.jsx";

function Component(props) {
    console.log("Начинаю рендерить Repair");
    const { contractKey } = props;

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
            <Space id={"Repair"} direction="vertical" style={{ width: "100%" }}>
                {contextHolder}
                <ContractHead contractKey={contractKey} />
                <Divider />
                <Space direction={HORIZONTAL} align={"center"}>
                    <GroupAction contractKey={contractKey} />
                    <GroupActionProgress />
                </Space>
                <RepairTable contractKey={contractKey} />
                <RepairAddDevice contractKey={contractKey} />
                <Divider />
            </Space>
        </Provider>
    );
}

export const Repair = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
