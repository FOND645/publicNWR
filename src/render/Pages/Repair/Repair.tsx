import { Divider, Space } from 'antd';
import React, { FC } from 'react';
import { ContractHead } from './Components/ContractHead';
import { AddDevice } from './Components/AddDevice';
import { RepairTable } from './Components/RepairTable';
import { useParams } from 'react-router-dom';
import styles from './Repair.module.css';

type props = {};

export const Repair: FC<props> = ({}) => {
    const contractID = +(useParams().contractID as string);
    return (
        <Space
            id={'Repair'}
            className={styles.RepairContainer}
            direction="vertical">
            <ContractHead contractID={contractID} />
            <Divider className={styles.RepairDivider} />
            {/* <Space direction={"horizontal"} align={"center"}>
                <GroupAction contractKey={contractKey} />
                <GroupActionProgress />
            </Space> */}
            <RepairTable contractID={contractID} />
            <AddDevice contractID={contractID} />
            <Divider className={styles.RepairDivider} />
        </Space>
    );
};
