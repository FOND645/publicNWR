import { Divider, Space } from "antd";
import React from "react";
import { DefectDescription } from "./DefectDescription.jsx";
import { ActionsTable } from "./ActionsTable.jsx";
import { isEqual } from "lodash";
import { AddNewAction } from "./AddNewAction.jsx";
import { AddExistAction } from "./AddExistAction.jsx";

import { VERTICAL } from "../../constants";

function Component(props) {
    const { defectKey } = props;

    return (
        <Space.Compact block direction={VERTICAL}>
            <DefectDescription defectKey={defectKey} />
            <Divider />
            <ActionsTable defectKey={defectKey} />
            <AddNewAction defectKey={defectKey} />
            <AddExistAction defectKey={defectKey} />
        </Space.Compact>
    );
}

export const DefectExpand = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
