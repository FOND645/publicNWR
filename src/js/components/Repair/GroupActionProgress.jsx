import { Progress } from "antd";
import React, { useEffect, useState } from "react";
import { green, red } from '@ant-design/colors';
import { isEqual } from "lodash";

function Component(props) {

    const [options, setOptions] = useState({ percent: 0, steps: 0, colors: [], enable: false })
    const { percent, colors, steps, enable } = options

    function actionStarted(event) {
        console.log("action started")
        console.log("event", event)
        const { totalCount } = event
        setOptions((oldOptions) => {
            const { percent, colors, steps, enable } = oldOptions
            return {
                percent: 0,
                colors: [],
                steps: totalCount,
                enable: true
            }
        })
        console.log("options", JSON.stringify(options))
    }

    function actionSigleResult(event) {
        console.log("action in progress")
        console.log("event", event)
        const { isSuccess } = event
        const color = isSuccess ? green[6] : red[6]
        setOptions((oldOptions) => {
            const { percent, colors, steps, enable } = oldOptions
            return {
                percent: percent + (100 / steps),
                colors: [...colors, color],
                steps,
                enable
            }
        })
        console.log("options", JSON.stringify(options))
    }

    function actionResult(event) {
        console.log("action finish")
        console.log("event", event)
        setOptions((oldOptions) => {
            const { percent, colors, steps, enable } = oldOptions
            return {
                percent: 100,
                colors,
                steps,
                enable
            }
        })
        setTimeout(() => {
            setOptions({
                percent: 0,
                colors: [],
                steps: 0,
                enable: false
            })
        }, 6000)
        console.log("options", JSON.stringify(options))
    }

    useEffect(() => {
        document.addEventListener("group_action_started", actionStarted);
        document.addEventListener("group_action_single_result", actionSigleResult);
        document.addEventListener("group_action_result", actionResult);
        return () => {
            document.removeEventListener("group_action_started", actionStarted);
            document.removeEventListener("group_action_single_result", actionSigleResult);
            document.removeEventListener("group_action_result", actionResult);
        }
    }
    )

    return enable ? <Progress style={{ width: "15rem" }} percent={percent} steps={steps} strokeColor={colors} /> : <></>
}

export const GroupActionProgress = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps))