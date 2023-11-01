import { Form, Input } from 'antd';
import React, { FC } from 'react';
import { defectAction } from '@src/server/GETqueries';
import styles from './ActionField.module.css';

type props = {
    data: defectAction;
    field: keyof defectAction;
    editingID: number | false;
};

export const ActionField: FC<props> = ({ data, field, editingID }) => {
    const { id } = data;

    if (editingID === id) {
        return (
            <Form.Item
                name={`${id}_${field}`}
                initialValue={data[field]}
                className={styles.ActionFieldForm}>
                <Input className={styles.ActionFieldInput} />
            </Form.Item>
        );
    } else {
        return data[field];
    }
};
