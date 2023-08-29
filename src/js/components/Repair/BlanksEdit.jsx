import { Button, Space, Typography, Upload } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { isEqual } from "lodash";
import { fileAvailable, importBlank } from "../../functions";
import { shell } from "electron";

const { Text } = Typography;
const path = require("path");

function Component(props) {
    // console.log("Начинаю рендерить BlanksEditor");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey } = route;

    // Извлекаем хранилище
    const dataBasePath = useSelector(
        (state) => state.settings.dataBasePath,
        (oldState, newState) => oldState == newState
    );

    // Ищем текущее устройство в базе контрактов
    const currentDevice = useSelector(
        (state) => {
            const currentContract = state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            return repairBase.find((device) => device.key == deviceKey);
        },
        (oldDevice, newDevice) => oldDevice.deviceKey == newDevice.deviceKey
    );

    const devKey = currentDevice.deviceKey;

    // Создаем пути к документам и папкам (дефектовки, ПВР) и шаблонам
    const blanksFolder = path.resolve(dataBasePath, "blanks", contractKey);
    const defectBlankPath = path.resolve(blanksFolder, `${devKey}_defectBlank.xlsx`);
    const actionBlankPath = path.resolve(blanksFolder, `${devKey}_actionBlank.xlsx`);

    // Булево значение указывающее на доступность бланков
    const defectBlankAvailable = fileAvailable(defectBlankPath);
    const actionBlankAvailable = fileAvailable(actionBlankPath);

    // Функция возвращает кнопки с функционалом в зависимости от типа
    function buttons(type) {
        const blankPath = type == "defect" ? defectBlankPath : actionBlankPath;
        const available = type == "defect" ? defectBlankAvailable : actionBlankAvailable;

        return available ? (
            <Space.Compact direction="horizontal">
                <Button onClick={() => shell.openPath(blankPath)}>Октрыть</Button>
                <Upload
                    accept=".xlsx"
                    showUploadList={false}
                    beforeUpload={(file) => {
                        importBlank(file, blankPath);
                        return false;
                    }}
                >
                    <Button>Заменить</Button>
                </Upload>
            </Space.Compact>
        ) : (
            <Space>
                <Upload
                    accept=".xlsx"
                    showUploadList={false}
                    beforeUpload={(file) => {
                        importBlank(file, blankPath);
                        return false;
                    }}
                >
                    <Button>Импортировать</Button>
                </Upload>
            </Space>
        );
    }

    return (
        <Space direction="vertical">
            <Space>
                <Text type={actionBlankAvailable ? "" : "warning"}>Шаблон дефектовки</Text>
                {buttons("defect")}
            </Space>
            <Space>
                <Text type={actionBlankAvailable ? "" : "warning"}>Шаблок перечня</Text>
                {buttons("action")}
            </Space>
        </Space>
    );
}

export const BlanksEditor = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
