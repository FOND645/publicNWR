import { Space } from 'antd';
import React, { FC } from 'react';
import { ContractsTable } from './ContractsTable';
import { AddContract } from './AddContract';
import styles from './OrganizationExpand.module.css';

type props = {
    organizationID: number;
};

export const OrganizationExpand: FC<props> = ({ organizationID }) => {
    return (
        <Space
            direction="vertical"
            className={styles.OrganizationExpand}>
            <ContractsTable organizationID={organizationID} />
            <AddContract organizationID={organizationID} />
        </Space>
    );
};
