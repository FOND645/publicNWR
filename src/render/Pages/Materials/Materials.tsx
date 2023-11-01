import { Divider, Space, Typography } from 'antd';
import React, { FC } from 'react';
import { AddMaterial } from './Components/AddMaterial';
import { MaterialsTable } from './Components/MaterialsTable';
import styles from './Materials.module.css';

const { Title } = Typography;

export const Materials: FC = () => {
    return (
        <Space.Compact
            className={styles.MaterialsContainer}
            direction="vertical">
            <Title
                level={2}
                className={styles.MaterialsTitle}>
                База материалов
            </Title>
            <Divider />
            <MaterialsTable />
            <AddMaterial />
        </Space.Compact>
    );
};
