import { Space, Typography } from "antd";
import { Provider } from "react-redux";
import React from "react";
import { store } from "../../storage/reducer.js";

const { Title } = Typography;

import { DocumentsEditor } from "./DocumentsEdit.jsx";
import { RepairNotes } from "./RepairNotes.jsx";
import { RepairDivided } from "./RepairDivided.jsx";
import { RepairDate } from "./RepairDate.jsx";
import { RepairSubTable } from "./RepairSubTable.jsx";
import { BlanksEditor } from "./BlanksEdit.jsx";
import { RepairAddSubDevice } from "./RepairAddSubDevice.jsx";
import { RepairAddNote } from "./RepairAddNote.jsx";
import { isEqual } from "lodash";

function Component(props) {
    // console.log("Начинаю рендерить RepairDeviceExpand");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;

    return (
        <Provider store={store}>
            <Space direction="horizontal" wrap={true} align={"start"}>
                <Space direction="vertical">
                    <Space direction="horizontal" wrap={true}>
                        <DocumentsEditor route={route} />
                        <BlanksEditor route={route} />
                    </Space>
                    <RepairDivided route={route} />
                    <RepairDate route={route} />
                    <RepairSubTable route={route} />
                    <RepairAddSubDevice route={route} />
                </Space>

                <Space direction="vertical">
                    <Title level={4}>Примечания</Title>
                    <RepairNotes route={route} />
                    <RepairAddNote route={route} />
                </Space>
            </Space>
        </Provider>
    );
}

export const RepairDeviceExpand = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
