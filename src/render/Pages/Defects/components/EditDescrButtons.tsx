import { Button, FormInstance, Space } from 'antd';
import React, { FC } from 'react';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { connection } from '@src/render/root';
import { editDefectQueryBody } from '@src/server/EDITqueries';
import { appContext } from '@src/render/context';
import styles from './EditDescrButtons.module.css';

type props = {
    Form: FormInstance;
    isEditing: boolean;
    startEditing: React.MouseEventHandler<HTMLElement>;
    discardChanges: () => void;
    defectID: number;
};

export const EditDescrButtons: FC<props> = ({
    Form,
    isEditing,
    startEditing,
    discardChanges,
    defectID,
}) => {
    if (appContext.auth.roots === 'watcher') return null;
    const confirmChanges = async () => {
        const blockID = Form.getFieldValue('blockID');

        const descriptionRaw = Form.getFieldValue('description');
        if (!descriptionRaw) {
            dispatchMessage({
                type: 'error',
                content: 'Описание не может быть пустым',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const description = descriptionRaw.trim();

        const solutionRaw = Form.getFieldValue('solution');
        const solution = solutionRaw ? solutionRaw.trim() : '';

        const defectRaw = Form.getFieldValue('defect');
        const defect = defectRaw ? defectRaw.trim() : '';

        const queryBody: editDefectQueryBody = {
            type: 'edit',
            url: 'defect',
            targetID: defectID as number,
            params: {
                blockID: blockID,
                description: description,
                defect: defect,
                solution: solution,
            },
        };
        connection?.send(JSON.stringify(queryBody));
        discardChanges();
    };

    return isEditing ? (
        <Space.Compact className={styles.EditDescrButtonsContainer}>
            <Button
                size={'small'}
                onClick={() => confirmChanges()}
                className={styles.EditDescrButtonConfirm}>
                <CheckOutlined />
            </Button>
            <Button
                size={'small'}
                onClick={discardChanges}
                className={styles.EditDescrButtonCancle}>
                <CloseOutlined />
            </Button>
        </Space.Compact>
    ) : (
        <Button
            size={'small'}
            onClick={startEditing}
            className={styles.EditDescrButtonEdit}>
            <EditOutlined />
        </Button>
    );
};
