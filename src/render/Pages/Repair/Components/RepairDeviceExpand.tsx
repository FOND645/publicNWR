import { Space } from 'antd';
import React, { FC } from 'react';
import { DocumentsEditor } from './DocumentsEditor';
import { RepairNotes } from './RepairNotes';
import { AddBlock } from './AddBlock';
import { RepairBlocksTable } from './RepairBlocksTable';
import { SetDivided } from './SetDivided';
import { RepairDate } from './RepairDate';
import { BlanksEditor } from './BlanksEditor';
import styles from './RepairDeviceExpand.module.css';
import { Progress } from './Progress';
import { unitRepairJSONdata } from './RepairTable';
import { FilesCollapse } from './FilesCollapse';

type props = {
    unitRepairJSONdata: unitRepairJSONdata;
    contractID: number;
    repairDeviceID: number;
};

export const RepairDeviceExpand: FC<props> = ({
    repairDeviceID,
    contractID,
    unitRepairJSONdata,
}) => {
    return (
        <Space
            direction="horizontal"
            wrap={true}
            className={styles.RepairDeviceExpandContainer}
            align={'start'}>
            <Space
                direction="vertical"
                className={styles.RepairDeviceExpandMainContainer}>
                <Space
                    direction="horizontal"
                    className={styles.RepairDeviceExpandDocsEditorsContainer}
                    wrap={true}>
                    <DocumentsEditor
                        repairDeviceID={repairDeviceID}
                        contractID={contractID}
                    />
                    <BlanksEditor
                        repairDeviceID={repairDeviceID}
                        contractID={contractID}
                    />
                </Space>
                <SetDivided repairDeviceID={repairDeviceID} />
                <RepairDate repairDeviceID={repairDeviceID} />
                <RepairBlocksTable repairDeviceID={repairDeviceID} />
                <AddBlock repairDeviceID={repairDeviceID} />
            </Space>

            <Space.Compact
                direction="vertical"
                className={styles.RepairDeviceExpandAdditionalContainer}>
                <RepairNotes repairDeviceID={repairDeviceID} />
                {contractID === 0 ? (
                    <Progress
                        repairDeviceID={repairDeviceID}
                        unitRepairJSONdata={unitRepairJSONdata}
                    />
                ) : null}
            </Space.Compact>

            <FilesCollapse
                contractID={contractID}
                repairDeviceID={repairDeviceID}
            />
        </Space>
    );
};
