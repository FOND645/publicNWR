import { Typography } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

const { Text } = Typography;

function Component(props) {
    const { route, type } = props;
    const { defectKey, actionKey, materialKey } = route;

    const currentMaterial = useSelector(
        (state) => {
            const { defectsBase } = state;
            const currentDefect = defectsBase.find((defect) => defect.key == defectKey);
            const { actions } = currentDefect;
            const currentAction = actions.find((action) => action.key == actionKey);
            const { materials } = currentAction;
            const currentMaterial = materials.find((material) => materialKey == material.key);
            return currentMaterial;
        },
        (oldMaterial, newMaterial) => isEqual(oldMaterial, newMaterial)
    );
    const matKey = currentMaterial.materialKey;

    const materialInBase = useSelector(
        (state) => {
            const { materialsBase } = state;
            const currentMaterial = materialsBase.find((material) => material.key == matKey);
            return currentMaterial;
        },
        (oldMaterial, newMaterial) => isEqual(oldMaterial, newMaterial)
    );

    return <Text>{materialInBase[type]}</Text>;
}

export const MaterialTableField = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
