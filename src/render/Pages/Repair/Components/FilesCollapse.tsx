import { Collapse, CollapseProps } from 'antd';
import React, { FC } from 'react';
import styles from './FilesCollapse.module.css';
import { PhotoForCollapse } from './PhotoForCollapse';
import { FileForCollapse } from './FileForCollapse';

type props = {
    contractID: number;
    repairDeviceID: number;
};

export const FilesCollapse: FC<props> = ({ contractID, repairDeviceID }) => {
    const isUnitContract = contractID === 0;
    let CollapsItems: CollapseProps['items'] = [
        {
            key: 'photo',
            label: 'Фотографии',
            children: (
                <PhotoForCollapse
                    contractID={contractID}
                    repairDeviceID={repairDeviceID}
                    type="photo"
                />
            ),
        },
        {
            key: 'notes',
            label: 'Опись',
            children: (
                <PhotoForCollapse
                    contractID={contractID}
                    repairDeviceID={repairDeviceID}
                    type="note"
                />
            ),
        },
    ];
    if (isUnitContract)
        CollapsItems.push(
            {
                key: 'contract',
                label: 'Контракт',
                children: (
                    <FileForCollapse
                        contractID={contractID}
                        repairDeviceID={repairDeviceID}
                        isUnit={true}
                        type="contract"
                    />
                ),
            },
            {
                key: 'mails',
                label: 'Письма',
                children: (
                    <FileForCollapse
                        contractID={contractID}
                        repairDeviceID={repairDeviceID}
                        isUnit={true}
                        type="mail"
                    />
                ),
            }
        );
    return (
        <Collapse
            size="small"
            items={CollapsItems}
            className={styles.FilesCollapse}
        />
    );
};
