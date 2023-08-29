import { Checkbox, Space, Typography } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchProps } from "../../storage/reducer";
import { isEqual } from "lodash";

const { Text } = Typography;

function Component(props) {
    // console.log("Начинаю рендерить RepairDivided");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey } = route;

    const divided = useSelector(
        (state) => {
            const contract = state.contracts.find((contract) => contract.key == contractKey);
            const device = contract.repairBase.find((device) => device.key == deviceKey);
            return device.divided;
        },
        (oldState, newState) => {
            console.log("Вызвана переотрисовка divided")
            console.log("States:", oldState, newState)
            console.log("Результат", oldState == newState)
            return oldState == newState}
    );

    const storeDispatch = dispatchProps(useDispatch());

    function setDivider(event) {
        const { target } = event;
        const { checked } = target;
        console.log(event);
        storeDispatch.setDivider(contractKey, deviceKey, checked);
    }

    return (
        <Space direction="horizontal">
            <Checkbox checked={divided} onChange={setDivider} />
            <Text>Делить перечень на строки?</Text>
        </Space>
    );
}

export const RepairDivided = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
