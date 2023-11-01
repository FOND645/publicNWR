import { DeleteOutlined } from '@ant-design/icons';
import { Button, Collapse, Space } from 'antd';
import React, { FC } from 'react';
import { DefectContent } from './DefectContent';
import { connection } from '@src/render/root';
import { deleteBlockDefectQuery } from '@src/server/DELETEqueries';
import { appContext } from '@src/render/context';
import styles from './DefectItem.module.css';

type props = {
    defectID: number;
    repairBlockID: number;
    description: string;
};

export const DefectItem: FC<props> = ({
    defectID,
    description,
    repairBlockID,
}) => {
    if (appContext.auth.roots === 'watcher') return null;
    const deleteDefect: React.MouseEventHandler<HTMLElement> = () => {
        const queryBody: deleteBlockDefectQuery = {
            type: 'delete',
            url: 'blockDefect',
            params: {
                blockID: repairBlockID,
                defectID: defectID,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };
    return (
        <Space className={styles.DefectItemContainer}>
            <Button
                onClick={deleteDefect}
                className={styles.DefectItemDeleteButton}>
                <DeleteOutlined />
            </Button>
            <Collapse
                size="small"
                className={styles.DefectItemCollapse}>
                <Collapse.Panel
                    className={styles.DefectItemCollapsePannel}
                    header={description}
                    key={defectID}>
                    <DefectContent defectID={defectID} />
                </Collapse.Panel>
            </Collapse>
        </Space>
    );
};
