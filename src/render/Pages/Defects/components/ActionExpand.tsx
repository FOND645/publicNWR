import { Divider, Space, Typography } from 'antd';
import React, { FC } from 'react';
import { MaterialsTable } from './MaterialsTable';
import { AddMaterial } from '@src/render/Pages/Materials/Components/AddMaterial';
import { AddExistMaterial } from './AddExistMaterial';
import styles from './ActionExpand.module.css';
const { Title } = Typography;

type props = {
    actionID: number;
};

export const ActionExpand: FC<props> = ({ actionID }) => {
    return (
        <Space.Compact
            className={styles.ActionExpandContainer}
            block
            direction={'vertical'}>
            <Title
                className={styles.ActionExpandTitle}
                level={3}>
                Использованные материалы
            </Title>
            <MaterialsTable actionID={actionID} />
            <Divider />
            <AddExistMaterial actionID={actionID} />
            <AddMaterial />
        </Space.Compact>
    );
};
