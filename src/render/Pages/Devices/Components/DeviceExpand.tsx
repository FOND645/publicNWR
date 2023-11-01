import { Space } from 'antd';
import React, { FC } from 'react';
import { BlocksTable } from './BlocksTable';
import { AddBlock } from './AddBlock';
import styles from './DeviceExpand.module.css';

type props = {
    deviceID: number;
};

export const DeviceExpand: FC<props> = ({ deviceID }) => {
    return (
        <Space
            className={styles.DeviceExpand}
            direction="vertical">
            <BlocksTable deviceID={deviceID} />
            <AddBlock deviceID={deviceID} />
        </Space>
    );
};
