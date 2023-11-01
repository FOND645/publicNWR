import { Form, Input } from 'antd';
import React, { FC } from 'react';
import { material } from '@src/server/GETqueries';
import styles from './MaterialField.module.css';

type props = {
    data: material;
    field: keyof material;
    editingID: number | false;
};

export const MaterialField: FC<props> = ({ data, field, editingID }) => {
    const { id } = data;

    if (editingID === id) {
        return (
            <Form.Item
                name={`${id}_${field}`}
                initialValue={data[field]}
                className={styles.MaterialFieldFormItem}>
                <Input className={styles.MaterialFieldInput} />
            </Form.Item>
        );
    } else {
        return data[field];
    }
};
