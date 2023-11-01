import { Space, Typography } from 'antd';
import React, { FC } from 'react';
import { OrganizationsTable } from './Components/OrganizationsTable';
import { AddOrganization } from './Components/AddOrganization';
import styles from './ContractsSettings.module.css';
const { Title } = Typography;

type props = {};

export const ContractsSettings: FC<props> = ({}) => {
    return (
        <Space.Compact
            className={styles.ContractsSettingsContainer}
            direction="vertical">
            <Title
                level={2}
                className={styles.ContractsSettingsTitle}>
                Управление организациями и договорами
            </Title>
            <OrganizationsTable />
            <AddOrganization />
        </Space.Compact>
    );
};
