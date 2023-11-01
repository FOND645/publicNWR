import {
    Button,
    Checkbox,
    DatePicker,
    Form,
    Input,
    Space,
    Typography,
} from 'antd';
import React, { FC } from 'react';
import { unitRepairJSONdata } from './RepairTable';
import dayjs, { Dayjs } from 'dayjs';
import { cloneDeep } from 'lodash';
import { editUnitContractJSONQueryBody } from '@src/server/EDITqueries';
import { connection } from '@src/render/root';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import styles from './Progress.module.css';
import { EnterOutlined } from '@ant-design/icons';
const { Paragraph } = Typography;

type props = {
    unitRepairJSONdata: unitRepairJSONdata;
    repairDeviceID: number;
};

export const Progress: FC<props> = ({ unitRepairJSONdata, repairDeviceID }) => {
    const { progress } = unitRepairJSONdata;
    const [AddProgressForm] = Form.useForm();
    console.log(unitRepairJSONdata);
    const editProgressName = (index: number) => {
        return (text: string) => {
            const newUnitRepairJSON = cloneDeep(unitRepairJSONdata);
            newUnitRepairJSON.progress[index].name = text;
            const queryBody: editUnitContractJSONQueryBody = {
                type: 'edit',
                url: 'editUnitContractJSON',
                targetID: repairDeviceID,
                params: {
                    JSON: JSON.stringify(newUnitRepairJSON),
                },
            };
            connection?.send(JSON.stringify(queryBody));
        };
    };

    const setDate = (index: number) => {
        return (value: null | false | Dayjs) => {
            const newUnitRepairJSON = cloneDeep(unitRepairJSONdata);
            const newTime = value ? value.toDate().getTime() : false;
            newUnitRepairJSON.progress[index].time = newTime;
            newUnitRepairJSON.progress = newUnitRepairJSON.progress.sort(
                (A, B) => {
                    if (A.time && B.time) return A.time - B.time;
                    if (!A.time && B.time) return 1;
                    if (A.time && !B.time) return -1;
                    return 0;
                }
            );
            const queryBody: editUnitContractJSONQueryBody = {
                type: 'edit',
                url: 'editUnitContractJSON',
                targetID: repairDeviceID,
                params: {
                    JSON: JSON.stringify(newUnitRepairJSON),
                },
            };
            connection?.send(JSON.stringify(queryBody));
        };
    };

    const setComplite = (index: number) => {
        return (event: CheckboxChangeEvent) => {
            const newUnitRepairJSON = cloneDeep(unitRepairJSONdata);
            newUnitRepairJSON.progress[index].time = event.target.checked
                ? new Date().getTime()
                : false;
            const queryBody: editUnitContractJSONQueryBody = {
                type: 'edit',
                url: 'editUnitContractJSON',
                targetID: repairDeviceID,
                params: {
                    JSON: JSON.stringify(newUnitRepairJSON),
                },
            };
            connection?.send(JSON.stringify(queryBody));
        };
    };

    return (
        <Space.Compact
            direction="vertical"
            className={styles.ProgressContainer}>
            {progress.map((ProgressItem, index) => {
                const { name, time } = ProgressItem;
                const eventDate = time ? new Date(time) : undefined;
                return (
                    <Space.Compact
                        direction="vertical"
                        className={styles.ProgressItemContainer}>
                        <Paragraph
                            className={styles.ProgressParagraph}
                            editable={{
                                text: name,
                                onChange: editProgressName(index),
                            }}>
                            {name}
                        </Paragraph>
                        <Space.Compact
                            direction="horizontal"
                            className={styles.ProgressDateContainer}>
                            <Checkbox
                                checked={Boolean(time)}
                                onChange={setComplite(index)}
                                className={styles.ProgressCheckBox}
                            />
                            <DatePicker
                                disabled={!time}
                                defaultValue={dayjs(eventDate)}
                                onChange={setDate(index)}
                                className={styles.ProgressDatePicker}
                            />
                        </Space.Compact>
                    </Space.Compact>
                );
            })}

            <Space.Compact
                direction="horizontal"
                className={styles.ProgressAddContainer}>
                <Form
                    form={AddProgressForm}
                    className={styles.ProgressAddForm}>
                    <Form.Item className={styles.ProgressAddFormItem}>
                        <Input className={styles.ProgressAddInput} />
                    </Form.Item>
                </Form>
                <Button className={styles.ProgressAddButton}>
                    <EnterOutlined />
                </Button>
            </Space.Compact>
        </Space.Compact>
    );
};
