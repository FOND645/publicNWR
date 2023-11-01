import { EditOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import React, { FC } from 'react';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { addNewRepairNoteQueryBody } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import { appContext } from '@src/render/context';
import styles from './AddRepairNote.module.css';

type props = {
    repairDeviceID: number;
};

export const AddRepairNote: FC<props> = ({ repairDeviceID }) => {
    const [addNoteForm] = Form.useForm();

    const addNote: React.MouseEventHandler<HTMLElement> = () => {
        const text: string | undefined = addNoteForm.getFieldValue('text');
        if (!text) {
            dispatchMessage({
                type: 'error',
                content: 'Введите текст примечания',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addNewRepairNoteQueryBody = {
            type: 'add',
            url: 'note',
            params: {
                text: text.trim(),
                repairDeviceID: repairDeviceID,
            },
        };

        connection?.send(JSON.stringify(queryBody));
    };
    if (appContext.auth.roots === 'watcher') return null;

    return (
        <Form
            form={addNoteForm}
            className={styles.AddRepairNoteForm}>
            <Space.Compact className={styles.AddRepairNoteContainer}>
                <Form.Item
                    name={'text'}
                    className={styles.AddRepairNoteFormItem}>
                    <Input.TextArea
                        placeholder="Введите примечание"
                        className={styles.AddRepairNoteInput}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                    />
                </Form.Item>
                <Button
                    onClick={addNote}
                    className={styles.AddRepairNoteButton}>
                    <EditOutlined />
                </Button>
            </Space.Compact>
        </Form>
    );
};
