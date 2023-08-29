import {
    AppstoreOutlined,
    ToolOutlined,
    BarsOutlined,
    FileOutlined,
    DeploymentUnitOutlined,
    ToTopOutlined,
    ReconciliationOutlined,
    CopyOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import React from "react";
import { useSelector } from "react-redux";

function Component(props) {
    // console.log("Начинаю рендерить MainMenu");
    // console.log("Props:");
    // console.log(props);
    const contracts = useSelector(
        (state) => state.contracts,
        (oldState, newState) => {
            if (oldState.length != newState.length) return false;
            for (let i = 0; i < oldState.length; i++) {
                if (oldState[i].organizationName != newState[i].organizationName) return false;
                if (oldState[i].contractNumber != newState[i].contractNumber) return false;
            }
            return true;
        }
    );

    const items = [
        { key: "UnitContracts", label: "Единичный ремонт", icon: <FileOutlined /> },
        {
            key: "contracts",
            label: "Договоры",
            style: { whiteSpace: "normal", wordWrap: "break-word" },
            icon: <BarsOutlined />,
            children: [
                { key: "ContractsSettings", label: "Управление договорами", icon: <CopyOutlined /> },
                ...contracts.map((contract) => {
                    return {
                        key: `Repair_${contract.key}`,
                        label: contract.organizationName + " №..." + [...contract.contractNumber].reverse().slice(0, 5).reverse().join(""),
                        icon: null,
                    };
                }),
            ],
        },
        {
            key: "dataBase",
            label: "База данных",
            icon: <ReconciliationOutlined />,
            style: { whiteSpace: "normal", wordWrap: "break-word" },
            children: [
                { key: "DevicesBaseEditor", label: "Изделия", icon: <AppstoreOutlined /> },
                { key: "DefectsBaseEditor", label: "Неисправности", icon: <ToolOutlined /> },
                { key: "MaterialsEditor", label: "Материалы (ПКИ)", icon: <DeploymentUnitOutlined /> },
            ],
        },
        { key: "AppSettings", label: "Настройки", icon: <SettingOutlined /> },
    ];

    function menuHandler(event) {
        const { key } = event;
        let menuEvent = new Event("menu_clicked", { bubbles: true, composed: true });
        if (key.includes("Repair")) {
            menuEvent.content = { type: key.split("_")[0], key: key.split("_")[1] };
        } else {
            menuEvent.content = key;
        }
        document.dispatchEvent(menuEvent);
    }

    return <Menu mode="inline" items={items} onClick={menuHandler} style={{ whiteSpace: "normal", wordWrap: "break-word" }} />;
}

export const MainMenu = React.memo(Component, () => true);
