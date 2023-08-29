import { Button, Space } from "antd";
import React, { useState } from "react";
import { shell } from "electron";
import { fileAvailable, defectList, actionList } from "../../functions";
import { useSelector } from "react-redux";
import { isEqual } from "lodash";

const path = require("path");

function Component(props) {
    console.log("Начинаю рендерить DocumentsEditor");
    // console.log("Props:");
    // console.log(props);
    const { route } = props;
    const { contractKey, deviceKey } = route;

    // Ищем текущее устройство в базе контрактов
    const currentDevice = useSelector(
        (state) => {
            const currentContract = state.contracts.find((contract) => contract.key == contractKey);
            const { repairBase } = currentContract;
            return repairBase.find((device) => device.key == deviceKey);
        },
        (oldDevice, newDevice) =>
            oldDevice.deviceKey == newDevice.deviceKey &&
            oldDevice.repairNumber == newDevice.repairNumber &&
            oldDevice.serialNumber == newDevice.serialNumber
    );
    const devKey = currentDevice.deviceKey;

    // Ищем это же устройство в базе устройств
    const currentDeviceInBase = useSelector(
        (state) => state.devicesBase.find((device) => device.key == devKey),
        (oldDevice, newDevice) => oldDevice.name == newDevice.name
    );
    const { repairNumber, serialNumber } = currentDevice;
    const { name } = currentDeviceInBase;

    // Извлекаем хранилище - пути к БД шаблонов и документов
    const dataBasePath = useSelector(
        (state) => state.settings.dataBasePath,
        (oldState, newState) => oldState == newState
    );
    const documentsBasePath = useSelector(
        (state) => state.settings.documentsBasePath,
        (oldState, newState) => oldState == newState
    );

    const [force, forceRender] = useState(false)
    console.log(fileAvailable(defectListPath))

    // Создаем пути к документам и папкам (дефектовки, ПВР) и шаблонам
    const defectListsFoler = path.resolve(documentsBasePath, contractKey, "Карты дефектации");
    const defectListPath = path.resolve(defectListsFoler, `${name} - № ${repairNumber} ${serialNumber}.xlsx`);

    const acitonListsFolder = path.resolve(documentsBasePath, contractKey, "Перечни выполненых работ");
    const actionListPath = path.resolve(acitonListsFolder, `${name} - № ${repairNumber} ${serialNumber}.xlsx`);

    const blanksFolder = path.resolve(dataBasePath, "blanks", contractKey);
    const defectBlankPath = path.resolve(blanksFolder, `${devKey}_defectBlank.xlsx`);
    const actionBlankPath = path.resolve(blanksFolder, `${devKey}_actionBlank.xlsx`);

    // Обработка нажатия клавиш "Открыть" и "Папка"
    function openInExplorer(target) {
        switch (target) {
            case "defect_list":
                shell.openPath(defectListPath);
                break;
            case "defect_folder":
                shell.showItemInFolder(defectListPath);
                break;
            case "action_list":
                shell.openPath(actionListPath);
                break;
            case "action_folder":
                shell.showItemInFolder(actionListPath);
                break;
        }
    }

    function createDefectList() {
        defectList(route).then((result) => {
            const { defectListPath } = result
            let successEvent = new Event("page_notification", { bubbles: true, composed: true });
            successEvent.description = {
                type: "success",
                content: `Создана карта дефектации. Путь: ${defectListPath}`,
                duration: 3,
            };
            document.dispatchEvent(successEvent)
            forceRender(!force)
        }).catch((error) => {
            console.error(error)
            let errorEvent = new Event("page_notification", { bubbles: true, composed: true });
            errorEvent.description = {
                type: "error",
                content: `При выполнении оперцаии произошла ошибка. ${JSON.stringify(error)}`,
                duration: 5,
            };
            document.dispatchEvent(errorEvent)
        })
    }

    function createActionList() {
        actionList(route).then((result) => {
            const { actionListPath } = result
            let successEvent = new Event("page_notification", { bubbles: true, composed: true });
            successEvent.description = {
                type: "success",
                content: `Создан перечень. Путь: ${actionListPath}`,
                duration: 3,
            };
            document.dispatchEvent(successEvent)
            forceRender(!force)
        }).catch((error) => {
            console.error(error)
            let errorEvent = new Event("page_notification", { bubbles: true, composed: true });
            errorEvent.description = {
                type: "error",
                content: `При выполнении оперцаии произошла ошибка. ${JSON.stringify(error)}`,
                duration: 5,
            };
            document.dispatchEvent(errorEvent)
        })
    }

    return (
        <Space direction="vertical">
            <Space.Compact direction="horizontal">
                <Button disabled={!fileAvailable(defectBlankPath)} onClick={createDefectList}>Создать карту дефектации</Button>
                <Button disabled={!fileAvailable(defectListPath)} onClick={() => openInExplorer("defect_list")}>
                    Открыть
                </Button>
                <Button disabled={!fileAvailable(defectListPath)} onClick={() => openInExplorer("defect_folder")}>
                    Папка
                </Button>
            </Space.Compact>
            <Space.Compact>
                <Button disabled={!fileAvailable(actionBlankPath)} onClick={createActionList}>Создать перечень выполненых работ</Button>
                <Button disabled={!fileAvailable(actionListPath)} onClick={() => openInExplorer("action_list")}>
                    Открыть
                </Button>
                <Button disabled={!fileAvailable(actionListPath)} onClick={() => openInExplorer("action_folder")}>
                    Папка
                </Button>
            </Space.Compact>
        </Space>
    );
}

export const DocumentsEditor = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
