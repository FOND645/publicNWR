import { Form, InputNumber } from 'antd';
import React, { FC } from 'react';
import { actionMaterial } from '@src/server/GETqueries';
import styles from './MaterialsField.module.css';

type props = {
    data: actionMaterial;
    field: keyof actionMaterial;
    editingID: number | false;
};

export const MaterialField: FC<props> = ({ data, field, editingID }) => {
    const { material_id } = data;
    if (editingID === material_id) {
        return (
            <Form.Item
                name={`${material_id}_${field}`}
                className={styles.MaterialFieldItem}
                initialValue={data[field]}>
                <InputNumber className={styles.MaterialFieldInputNumber} />
            </Form.Item>
        );
    } else {
        return data[field];
    }
};
