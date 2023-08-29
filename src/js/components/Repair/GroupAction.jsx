import { Button, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { HORIZONTAL } from "../../constants";
import { actionList, defectList } from "../../functions";
import { dispatchProps } from "../../storage/reducer";
import { useDispatch } from "react-redux";
import { isEqual } from "lodash";

const {Text} = Typography

function Component(props) {
    const { contractKey } = props

    const storeDispatch = dispatchProps(useDispatch())

    // Стейт для чекбоксов
    const [checkedDevices, setCheckedDevices] = useState([]);

    // Листнер для чекбоксов номеров
    function checkboxDeviceHandler(event) {
        // При тестировании - проверить что будет в event`e
        const { checked, key } = event;
        if (checked) {
            setCheckedDevices([...checkedDevices, key]);
        } else {
            setCheckedDevices(checkedDevices.filter((k) => k != key));
        }
    }

    useEffect(() => {
        // Ставим слушатели сбытий
        document.addEventListener("device_checked", checkboxDeviceHandler);

        return () => {
            document.removeEventListener("device_checked", checkboxDeviceHandler);
        };
    });

    function groupAction(type) {
        // Созадем событие - обработка групового действия началась.
        let eventGroupStarted = new Event("group_action_started", { bubbles: true, composed: true });
        eventGroupStarted.totalCount = checkedDevices.length
        document.dispatchEvent(eventGroupStarted)

        // Создаем массив с успешными и неуспешными действиями
        let success = []
        let errors = []

        // Создаем событие - результат выполнения каждого отдельного действия
        let eventSingleResult = new Event("group_action_single_result", { bubbles: true, composed: true });

        // Прогоняем все выбранные устройства
        checkedDevices.forEach(deviceKey => {
            const route = { contractKey, deviceKey }
            eventSingleResult.targetRoute = route
            switch (type) {
                case "defect_list":
                    defectList(route).then(result => {
                        eventSingleResult.isSuccess = true
                        document.dispatchEvent(eventSingleResult)
                        success.push(route)
                    }).catch(error => {
                        eventSingleResult.isSuccess = false
                        document.dispatchEvent(eventSingleResult)
                        errors.push({ route, error })
                    })
                    break;
                case "action_list":
                    actionList(route).then(result => {
                        eventSingleResult.isSuccess = true
                        document.dispatchEvent(eventSingleResult)
                        success.push(route)
                    }).catch(error => {
                        eventSingleResult.isSuccess = false
                        document.dispatchEvent(eventSingleResult)
                        errors.push({ route, error })
                    })
                    break;
                case "remove":
                    try {
                        storeDispatch.removeRepairDevice(contractKey, deviceKey)
                        eventSingleResult.isSuccess = true
                        document.dispatchEvent(eventSingleResult)
                        success.push(route)
                    } catch (error) {
                        eventSingleResult.isSuccess = false
                        document.dispatchEvent(eventSingleResult)
                        errors.push({ route, error })
                    }
                    break;
                default:
                    break;
            }
        })

        // Создаем событие - результат группового действия
        let eventTotalResult = new Event("group_action_result", { bubbles: true, composed: true });
        eventTotalResult.success = success
        eventTotalResult.errors = errors
        document.dispatchEvent(eventTotalResult)
    }

    return (
        <Space.Compact direction={HORIZONTAL}>
            <Button disabled={checkedDevices.length == 0} onClick={() => groupAction("defect_list")}>
                Созадть карты дефектации
            </Button>
            <Button disabled={checkedDevices.length == 0} onClick={() => groupAction("action_list")}>
                Создать перечни выполненых работ
            </Button>
            <Button disabled={checkedDevices.length == 0} onClick={() => groupAction("defect_list")}>
                Удалить
            </Button>
        </Space.Compact>
    )
}

export const GroupAction = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps))