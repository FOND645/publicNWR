import { Divider, Space } from 'antd';
import React, { FC } from 'react';
import { DefectDescription } from './DefectDescription';
import { ActionsTable } from './ActionsTable';
import { AddNewAction } from './AddNewAction';
import { AddExistAction } from './AddExistAction';
import styles from './DefectExpand.module.css';

type props = {
    defectID: number;
};

export const DefectExpand: FC<props> = ({ defectID }) => {
    return (
        <Space.Compact
            block
            direction={'vertical'}
            className={styles.DefectExpand}>
            <DefectDescription defectID={defectID} />
            <Divider />
            <ActionsTable defectID={defectID} />
            <AddNewAction defectID={defectID} />
            <AddExistAction defectID={defectID} />
        </Space.Compact>
    );
};
