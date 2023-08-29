import { Typography } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

const { Text } = Typography;

function Component(props) {
    const { deviceKey, field } = props;

    const fieldValue = useSelector(
        (state) => {
            const { devicesBase } = state;
            let dev, subDev, includes;
            for (let devInd = 0; devInd < devicesBase.length; devInd++) {
                dev = devicesBase[devInd];
                includes = dev.includes;
                if (dev.key == deviceKey) return dev[field];
                for (let subInd = 0; subInd < includes.length; subInd++) {
                    subDev = includes[subInd];
                    if (subDev.key == deviceKey) return subDev[field];
                }
            }
        },
        (oldField, newField) => {
            return oldField == newField;
        }
    );

    return <Text>{fieldValue}</Text>;
}

export const DefectTableField = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
