import {
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { appContext } from '@src/render/context';
import { Button, Popconfirm, Space } from 'antd';
import React, { FC } from 'react';
import styles from './EditButtons.module.css';

export type buttonMethods = {
    saveChanges: React.MouseEventHandler<HTMLElement>;
    setEditing: React.Dispatch<React.SetStateAction<number | false>>;
    deleteElement: (id: number) => void;
};

type props = {
    ID: number;
    editingID: false | number;
    methods: buttonMethods;
    deleteConfirmTitle: string;
};

export const EditButtons: FC<props> = ({
    ID,
    editingID,
    methods,
    deleteConfirmTitle,
}) => {
    const disabled = Boolean(editingID);

    const { deleteElement, setEditing, saveChanges } = methods;
    if (appContext.auth.roots === 'watcher')
        return (
            <Space.Compact className={styles.EditButtonsNoRoots}>
                <Button
                    disabled={true}
                    className={styles.EditButtonNoRoots}>
                    <EditOutlined disabled={true} />
                </Button>
                <Button
                    disabled={true}
                    className={styles.DeleteButtonNoRoots}>
                    <DeleteOutlined disabled={true} />
                </Button>
            </Space.Compact>
        );

    if (editingID === ID) {
        return (
            <Space.Compact className={styles.EditButtonsEditing}>
                <Button
                    onClick={saveChanges}
                    className={styles.ConfirmButton}>
                    <CheckOutlined />
                </Button>
                <Button
                    onClick={() => setEditing(false)}
                    className={styles.CloseButton}>
                    <CloseOutlined />
                </Button>
            </Space.Compact>
        );
    } else {
        return (
            <Space.Compact>
                <Button
                    disabled={disabled}
                    onClick={() => setEditing(ID)}
                    className={styles.EditButton}>
                    <EditOutlined disabled={disabled} />
                </Button>
                <Popconfirm
                    title={deleteConfirmTitle}
                    okText={'Да'}
                    cancelText={'Нет'}
                    disabled={disabled}
                    onConfirm={() => deleteElement(ID)}>
                    <Button
                        disabled={disabled}
                        className={styles.DeleteButton}>
                        <DeleteOutlined disabled={disabled} />
                    </Button>
                </Popconfirm>
            </Space.Compact>
        );
    }
};
