import { Space, Typography } from 'antd';
import React from 'react';
import { DefectsTable } from './components/DefectsTable';
import { AddDefect } from './components/AddDefect';
import styles from './Defects.module.css';

const { Title } = Typography;

export const Defects: React.FC = () => {
    return (
        <Space.Compact
            className={styles.DefectsContainer}
            block
            direction={'vertical'}>
            <Title
                level={2}
                className={styles.DefectsTitle}>
                База неисправностей
            </Title>
            <DefectsTable />
            <AddDefect />
        </Space.Compact>
    );
};
