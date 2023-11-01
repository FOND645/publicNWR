import { Space, Typography } from 'antd';
import React, { FC } from 'react';
import { AddDevice } from './Components/AddDevice';
import { DevicesTable } from './Components/DevicesTable';
import styles from './Devices.module.css';

const { Title } = Typography;

export const Devices: FC = () => {
    return (
        <Space.Compact
            className={styles.DevicesContainer}
            direction="vertical">
            <Title level={2}>База устройств</Title>
            <DevicesTable />
            <AddDevice />
        </Space.Compact>
    );
};
