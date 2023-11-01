import { formatToNumbericTime } from '@src/globalFunctions';
import React, { FC } from 'react';
import { repairNote } from '@src/server/GETqueries';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteRepairNoteQuery } from '@src/server/DELETEqueries';
import { connection } from '@src/render/root';
import styles from './RepairNote.module.css';

export const RepairNote: FC<repairNote> = ({ date, text, id }) => {
    const stringDate = formatToNumbericTime(date);

    const deleteNote = () => {
        const queryBody: deleteRepairNoteQuery = {
            type: 'delete',
            url: 'repairNote',
            targetID: id,
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <div className={styles.RepairNoteContainer}>
            <div className={styles.RepairNoteText}>{text}</div>
            <div className={styles.RepairNoteDate}>
                <DeleteOutlined onClick={deleteNote} />
                {` ${stringDate}\n`}
            </div>
        </div>
    );
};
