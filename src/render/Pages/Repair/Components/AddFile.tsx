import { PlusSquareOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import styles from './AddFile.module.css'

type props = {
    contractID: number;
    repairDeviceID: number;
    type: 'note' | 'mail' | 'contract' | 'photo'
}

export const AddFile: FC<props> = ({ contractID, repairDeviceID, type }) => {
    const addFile = () => {

    }


    return <div className={styles.AddFileContainer} onClick={addFile}>
        <PlusSquareOutlined className={styles.AddFileIcon} />
    </div>
}