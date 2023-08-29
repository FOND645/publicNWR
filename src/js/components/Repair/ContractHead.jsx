import React from "react";
import { Space, Typography } from "antd";
import { isEqual } from "lodash";
import { useSelector } from "react-redux";

const { Title } = Typography;

function Component(props) {
    // console.log("Начинаю рендерить ContractHead");
    // console.log("Props:");
    // console.log(props);
    // Что принимаем в пропсах
    const { contractKey } = props;

    const currentContract = useSelector(
        (state) => {
            return state.contracts.find((contract) => contract.key == contractKey);
        },
        (oldState, newState) => {
            return (
                oldState.organizationName == newState.organizationName &&
                oldState.contractDate == newState.contractDate &&
                oldState.contractNumber == newState.contractNumber
            );
        }
    );
    const { organizationName, contractDate, contractNumber } = currentContract;

    return (
        <Space.Compact direction="vertical">
            <Title level={1}>Текущая обстановка по договору</Title>
            <Title level={4}>№ {contractNumber}</Title>
            <Title level={4}>От {contractDate}</Title>
            <Title level={4}>Организация: {organizationName}</Title>
        </Space.Compact>
    );
}

export const ContractHead = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
